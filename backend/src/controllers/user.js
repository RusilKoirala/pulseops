
import db from "../lib/db.js"
import bcrypt from "bcrypt"
import { user } from "../db/schema.js"
import {success, z} from "zod"
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

    // Checking empty body
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" })
    }
    try {

        // Checking for existing user
        const existingUser = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.email, email),
        })
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "User already exists" 
            })
        }

        // Making hashed password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Inseting into db
        const [newUser] = await db
        .insert(user)
        .values({
             name, 
             email, 
             password: hashedPassword 
            })
        .returning();
        const { password: _, ...userWithoutPassword } = newUser;

        const token = crypto.randomUUID()
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await db.update(user)
            .set({ verificationToken: token, verificationTokenExpiry: expiry })
            .where(eq(user.id, newUser.id))
        
        await sendVerificationEmail(email, token)

        res.status(201).json({ success: true, data: userWithoutPassword })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
   
}

async function Login(req, res) {
    const {email, password } = req.body
    
    // Checking empty body
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" })
    }
    try {

        // Checking for user
        const existingUser = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.email, email),
        })
        if (!existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email or password" 
            })
        }

        // Checking for password 
        const isPasswordValid = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email or password" 
            })
        }

        // Jwt Token
        const jwt_token  = CreateJwtToken({ id: existingUser.id, email: existingUser.email })

        // Removing Sensitive Info
        const { password: _pw, id : _id, isVerified: _v,...userWithoutDetail } = existingUser;

        res.cookie("token", jwt_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Respone 
        res.json({ success: true, data: userWithoutDetail })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function Delete(req, res) {
    // Check the user by his jwt 
    const { id } = req.user

    try {
        // DELETE THE id which jwt has not anyone in random request :)
        const deletedUser = await db.delete(user).where(eq(user.id, id)).returning()
        res.clearCookie("token");
        res.json({ success: true, message: "Successfully Deleted" })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function Logout(req,res) {
    try {
        res.clearCookie("token");
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

async function Profile(req,res) {
    try {

        // Returning his data
        res.json({ success: true, data: req.user })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

async function VerifyEmail(req,res) {
    const { token } = req.query
    if (!token) return res.status(400).json({
        success: false,
        message: "Token required"
    })
    try {
        const [found] = await db.select().from(user).where(eq(user.verificationToken, token))
        if (!found) {
            res.status(400).json({
                success: false,
                message:"Invalid Token",
            })
        }
        if (new Date()> new Date(found.verificationTokenExpiry)) {
            return res.status(400).json({success:false, message:"Token expired"})
        }

        await db.update(user)
            .set({isVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            })
            where(eq(user.id, found.id))
        
        res.json({ success:true, message:"Email Verified"})
    } catch (error) {
        res.json({ success:false, message:error})
    }
}



async function ResendVerification(req,res) {
    const {id}= req.user
    try {
        const [found] = await db.select().from(user).where(eq(user.id,id))
        if (!found) return res.status(404).json({success: false, message: "User not found"})
        if (found.isVerified) return res.status(400).json({ success: false, message: "Already Verified"})
        
        const token = crypto.randomUUID()
        const expiry = new Date(Date.now+ 24*60*60*1000)

        await db.update(user)
            .set({verificationToken: token, verificationTokenExpiry: expiry})
            .where(eq(user.id, id))
        
        await sendVerificationEmail(found.email, token)
        res.json({success: true, message: "Verification Email Sent"})
    } catch (error) {
        res.json({success: false, message: error})
    }
}
export { Signup, Login , Delete, Logout, Profile, VerifyEmail, ResendVerification}
