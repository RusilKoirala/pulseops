import { eq, and, desc } from "drizzle-orm"
import db from "../lib/db.js"
import { teams, teamMembers, user, monitors } from "../db/schema.js"
import { z } from "zod"

const CreateTeamSchema = z.object({
    name: z.string().min(1),
})

const InviteTeamMemberSchema = z.object({
    email: z.string().email(),
    role: z.enum(["admin", "member"]).default("member"),
})

const UpdateTeamMemberRoleSchema = z.object({
    role: z.enum(["owner", "admin", "member"]),
})

// Create a new team
export async function createTeam(req, res) {
    const { name } = CreateTeamSchema.parse(req.body)
    const { id: userId } = req.user

    try {
        const [newTeam] = await db.insert(teams).values({ name, createdBy: userId }).returning()

        // Add creator as owner
        await db.insert(teamMembers).values({
            teamId: newTeam.id,
            userId: userId,
            role: "owner"
        })

        res.status(201).json({ success: true, data: newTeam })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// List all teams user is part of
export async function listUserTeams(req, res) {
    const { id: userId } = req.user

    try {
        const memberships = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId))
        const teamIds = memberships.map(m => m.teamId)

        if (teamIds.length === 0) {
            return res.json({ success: true, data: [] })
        }

        const userTeams = []
        for (const tid of teamIds) {
            const [t] = await db.select().from(teams).where(eq(teams.id, tid))
            if (t) userTeams.push(t)
        }

        const teamsWithMembership = userTeams.map(team => {
            const membership = memberships.find(m => m.teamId === team.id)
            return { ...team, role: membership.role }
        })

        res.json({ success: true, data: teamsWithMembership })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get team details and members
export async function getTeam(req, res) {
    const { teamId } = req.params
    const { id: userId } = req.user

    try {
        // Check if user is in team
        const [membership] = await db.select().from(teamMembers).where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
        )
        if (!membership) {
            return res.status(403).json({ success: false, message: "Not a team member" })
        }

        const [team] = await db.select().from(teams).where(eq(teams.id, teamId))
        const members = await db.select({
            id: teamMembers.id,
            userId: teamMembers.userId,
            role: teamMembers.role,
            joinedAt: teamMembers.joinedAt,
            name: user.name,
            email: user.email
        }).from(teamMembers)
            .innerJoin(user, eq(teamMembers.userId, user.id))
            .where(eq(teamMembers.teamId, teamId))

        res.json({ success: true, data: { team, members, currentUserRole: membership.role } })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Invite member to team
export async function inviteToTeam(req, res) {
    const { teamId } = req.params
    const { email, role } = InviteTeamMemberSchema.parse(req.body)
    const { id: userId } = req.user

    try {
        // Check if current user has permission (owner/admin)
        const [membership] = await db.select().from(teamMembers).where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
        )
        if (!membership || !["owner", "admin"].includes(membership.role)) {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        // Find user by email
        const [invitedUser] = await db.select().from(user).where(eq(user.email, email))
        if (!invitedUser) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        // Check if already in team
        const [existing] = await db.select().from(teamMembers).where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, invitedUser.id))
        )
        if (existing) {
            return res.status(400).json({ success: false, message: "User already in team" })
        }

        // Add to team
        const [newMember] = await db.insert(teamMembers).values({
            teamId,
            userId: invitedUser.id,
            role
        }).returning()

        res.json({ success: true, data: newMember })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Update member role
export async function updateTeamMemberRole(req, res) {
    const { teamId, memberId } = req.params
    const { role } = UpdateTeamMemberRoleSchema.parse(req.body)
    const { id: userId } = req.user

    try {
        // Check if current user is owner
        const [membership] = await db.select().from(teamMembers).where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
        )
        if (!membership || membership.role !== "owner") {
            return res.status(403).json({ success: false, message: "Only owner can change roles" })
        }

        // Update member role
        const [updated] = await db.update(teamMembers).set({ role }).where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.id, memberId))
        ).returning()

        res.json({ success: true, data: updated })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Remove member from team
export async function removeTeamMember(req, res) {
    const { teamId, memberId } = req.params
    const { id: userId } = req.user

    try {
        // Check permission
        const [membership] = await db.select().from(teamMembers).where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
        )
        if (!membership) {
            return res.status(403).json({ success: false, message: "Not a team member" })
        }

        // Get member to remove
        const [memberToRemove] = await db.select().from(teamMembers).where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.id, memberId))
        )
        if (!memberToRemove) {
            return res.status(404).json({ success: false, message: "Member not found" })
        }

        // Can't remove owner
        if (memberToRemove.role === "owner") {
            return res.status(400).json({ success: false, message: "Cannot remove owner" })
        }

        // Check if current user is owner/admin OR removing themselves
        const canRemove = membership.role === "owner" ||
            membership.role === "admin" ||
            memberToRemove.userId === userId

        if (!canRemove) {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        await db.delete(teamMembers).where(eq(teamMembers.id, memberId))
        res.json({ success: true, message: "Member removed" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Delete team
export async function deleteTeam(req, res) {
    const { teamId } = req.params
    const { id: userId } = req.user

    try {
        // Check if owner
        const [membership] = await db.select().from(teamMembers).where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
        )
        if (!membership || membership.role !== "owner") {
            return res.status(403).json({ success: false, message: "Only owner can delete team" })
        }

        await db.delete(teams).where(eq(teams.id, teamId))
        res.json({ success: true, message: "Team deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}