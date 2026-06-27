import db from "../lib/db.js"
import bcrypt from "bcrypt"
import { user } from "../db/schema.js"
import {  z } from "zod"
import { CreateJwtToken } from "../lib/jwt.js"
import { eq } from "drizzle-orm"
import { sendVerificationEmail } from "../lib/email.js"

const CreateUserSchema = z.object({
    name:  z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
})



async function Signup(req, res) {
    const {name , email, password } = CreateUserSchema.parse(req.body)

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" })
    }
    try {
        const existingUser = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.email, email),
        })
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const [newUser] = await db
            .insert(user)
            .values({ name, email, password: hashedPassword })
            .returning()

        const token = crypto.randomUUID()
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await db.update(user)
            .set({ verificationToken: token, verificationTokenExpiry: expiry })
            .where(eq(user.id, newUser.id))

        await sendVerificationEmail(email, token)

        const { password: _, ...userWithoutPassword } = newUser
        res.status(201).json({ success: true, data: userWithoutPassword })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function Login(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" })
    }
    try {
        const existingUser = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.email, email),
        })
        if (!existingUser) {
            return res.status(400).json({ success: false, message: "Invalid email or password" })
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid email or password" })
        }

        const jwt_token = CreateJwtToken({ id: existingUser.id, email: existingUser.email })

        const { password: _pw, id: _id, ...userWithoutDetail } = existingUser

        res.cookie("token", jwt_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })

        res.json({ success: true, data: userWithoutDetail })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function Delete(req, res) {
    const { id } = req.user
    try {
        await db.delete(user).where(eq(user.id, id)).returning()
        res.clearCookie("token")
        res.json({ success: true, message: "Successfully Deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function Logout(req, res) {
    try {
        res.clearCookie("token")
        res.json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

async function Profile(req, res) {
    try {
        const [found] = await db.select({
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
        }).from(user).where(eq(user.id, req.user.id))

        res.json({ success: true, data: found })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

async function VerifyEmail(req, res) {
    const { token } = req.query
    if (!token) return res.status(400).json({ success: false, message: "Token required" })

    try {
        const [found] = await db.select().from(user).where(eq(user.verificationToken, token))
        if (!found) {
            // return here to avoid "headers already sent" when code continues
            return res.status(400).json({ success: false, message: "Invalid token" })
        }
        if (new Date() > new Date(found.verificationTokenExpiry)) {
            return res.status(400).json({ success: false, message: "Token expired" })
        }

        await db.update(user)
            .set({ isVerified: true, verificationToken: null, verificationTokenExpiry: null })
            .where(eq(user.id, found.id))

        res.json({ success: true, message: "Email verified" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function ResendVerification(req, res) {
    const { id } = req.user
    try {
        const [found] = await db.select().from(user).where(eq(user.id, id))
        if (!found) return res.status(404).json({ success: false, message: "User not found" })
        if (found.isVerified) return res.status(400).json({ success: false, message: "Already verified" })

        const token = crypto.randomUUID()
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // was Date.now (missing call)

        await db.update(user)
            .set({ verificationToken: token, verificationTokenExpiry: expiry })
            .where(eq(user.id, id))

        await sendVerificationEmail(found.email, token)
        res.json({ success: true, message: "Verification email sent" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function ChangePassword(req, res) {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Both fields are required" })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" })
  }
  try {
    const [found] = await db.select().from(user).where(eq(user.id, req.user.id))
    if (!found) return res.status(404).json({ success: false, message: "User not found" })

    const valid = await bcrypt.compare(currentPassword, found.password)
    if (!valid) return res.status(400).json({ success: false, message: "Current password is incorrect" })

    const hashed = await bcrypt.hash(newPassword, 10)
    await db.update(user).set({ password: hashed }).where(eq(user.id, req.user.id))

    res.json({ success: true, message: "Password updated" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

async function DemoLogin(req,res) {
    const DEMO_EMAIL = "demo@pulseops.dev"
    const DEMO_PASSWORD = "demo1234"

    try {
        let demoUser = await db.query.user.findFirst({
            where: (u,{eq})=> eq(u.email, DEMO_EMAIL)
        })

        if (!demoUser) {
            const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)
            const [created] = await db.insert(user)
                .values({
                    name: "Demo User",
                    email: DEMO_EMAIL,
                    password: hashedPassword,
                    isVerified: true
                })
                .returning()
            demoUser = created
        }

        const jwt_token = CreateJwtToken({id: demoUser.id, email:demoUser.email})

        res.cookie("token", jwt_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })
        const {password:_, id:_id, ...safe}= demoUser
        res.json({
            success: true,
            data: safe,
        })
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export { Signup, Login, Delete, Logout, Profile, VerifyEmail, ResendVerification , ChangePassword, DemoLogin}
