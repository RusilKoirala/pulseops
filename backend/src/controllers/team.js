import { eq, and, desc} from "drizzle-orm"
import db from "../lib/db.js"
import { teams, teamMemebers, user,monitors } from "../db/schema.js"
import {date, email, success, z} from "zod"


// -- input validation :) --

const CreateTeamSchema = z.object({
    name: z.string().min(1),
})

const InviteTeamMembersSchema = z.object({
    email: z.string().email(),
    role: z.enum(["admin", "member"]).default("member"),
})

const UpdateTeamMemberRoleSchema = z.object({
    role: z.enum(["owner", "admin", "member"]),
})


// --- functions of team controller ---

// creat team
export async function createTeam(req, res) {
    const { name } = CreateTeamSchema.parse(req.body)
    const {id: userId} = req.user

    try {
        const [newTeam] = await db.insert(teams).values({
            name: name,
            createdBy: userId,
        }).returning()

        // make the user its owner
        await db.insert(teamMemebers).values({
            teamId: newTeam.id,
            userId: userId,
            role: "owner",
        })

        res.status(201).json({ 
            success: true,
            data: newTeam,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error,
        })
    }
}

// List User
export async function listUserTeams(req,res) {
    const {id: userId} = req.user

    try {
        const memberships = (await db.select().from(teamMemebers)).where(eq(teamMemebers.userId, userId))
        const teamIds = memberships.map(m => m.teamId)

        if(teamIds.length===0) {
            return res.json({
                success:false,
                data: [],
            })
        }

        const userTeams = await db.select().from(teams).where(eq(teams.id, teamIds[0]))

        for (let i=1; i<teamIds.length; i++) {
            const moreTeams = await db.select().from(teams).where(eq(teams.id, teamIds[i]))
            userTeams.push(...moreTeams)
        }

        const teamsWithMembership = userTeams.map(team => {
            const membership = memberships.find(m=> m.teamId === team.id)
            return { ...team, role: membership.role }
        })
        res.json({success: true, data: teamsWithMembership})
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
}

// get team details and member 
export async function getTeam(req,res) {
    const { teamId } = req.params
    const { id: userId } = req.user

    try {
        // check if user in team 
        const [membership] = await db.select().from(teamMemebers).where(
            and(
                eq(teamMemebers.id, teamId),
                eq(teamMemebers.userId, userId)
            )
        )

        if (!membership)
        {
            return res.status(403).json({ 
                success: false,
                message: "Not a team member",
            })
        }

        const [team] = await db.select().from(teams).where(eq(teams.id,teamId))

        const members = await db.select
        ({
            id: teamMemebers.id,
            userId: teamMemebers.userId,
            role: teamMemebers.role,
            joinedAt: teamMemebers.jointedAt,
            name: user.name,
            email: user.email,
        }).from(
            teamMemebers.innerJoin(
                user, eq(
                    teamMemebers.userId, user.id
                ).where(eq(
                    teamMemebers.teamId, teamId
                ))
            )
        )

        res.json({
            success: true,
            data: {
                team,
                members,
                currentUserRole: membership.role
            }
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// invite to team
export async function inviteToTeam(req, res) {
    const {teamId} = req.params
    const {email, role} = InviteTeamMembersSchema.parse(req.body)

    const {id: userId} = req.user

    try {
        // check if he has permission (owner/ admin)
        const [membership] = await db.select().from(teamMemebers).where(
            and(
                eq(teamMemebers.teamId, teamId),
                eq(teamMemebers.userId, userId)
            )
        )
        if (!membership || !["owner", "admin"].includes(membership.role)) {
            return res.status(403).json({
                success:false,
                message:"Not authorized",
            })
        }
        const [invitedUser] = await db.select().from(user).where(
            eq(user.email, email)
        )

        if(!invitedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const [existing] = await db.select().from(teamMemebers)
            .where(
                and(
                    eq(teamMemebers.teamId, teamId),
                    eq(teamMemebers.userId, invitedUser.id)
                )
            )
        if (existing) 
        {
            return res.json(400).json({
                success: false,
                message: "User already in team"
            })
        }

        const [newMember]= await db.insert(teamMemebers).values({
            teamId,
            userId: invitedUser.id,
            role,
        })

        res.json({success: true, data: newMember})

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }

}


// update member role (PROMOTION :D)
export async function updateTeamMemberRole(req ,res ) {
    const {teamId, memberId} = req.params
    const { role } = UpdateTeamMemberRoleSchema.parse(req.body)
    const {id: userId} = req.user

    try {
        const [membership] = await db.select().from(teamMemebers).where(
            and(
                eq(teamMemebers.teamId, teamId),
                eq(teamMemebers.userId, userId)
            )
        )

        if (!membership || membership.role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only owner can change roles"
            })
        }

        const [updated] = await db.update(teamMemebers).set({role}).where(
            and(eq(teamMemebers.teamId, teamId),
                eq(teamMemebers.id, memberId)
            )
        ).returning()

        res.json({ success: true, data: updated})
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// remove memver from team
export async function removeTeamMember(req,res) {
    const { teamId, memberId } = req.params
    const { id: userId } = req.user

    try {
        // check if he not bad boy (is he admin or owner??)
        const [membership] = await db.select().from(teamMemebers)
            .where(
                and(
                    eq(teamMemebers.teamId, teamId),
                    eq(teamMemebers.userId, userId)
                )
            )
        
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            })
        }

        const [membertoRemove] = await db.select().from(
            (teamMemebers).where(
                and(
                    eq(teamMemebers.teamId, teamId), eq(teamMemebers.id, memberId),
                    eq(teamMemebers.id,memberId)
                )
            )
        )
        if(!membertoRemove) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            })
        }


        // pls dont remove admin
        if( membertoRemove.role === "owner") 
        {
            return res.status(400).json({
                success: false,
                message: "Cannot remove owner"
            })
        }

        const canRemove = membership.role === "owner" || membership.role("admin") || membertoRemove.userId === userId

        if (!canRemove) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            })
        }

        await db.delete(teamMemebers).where(
            eq(teamMemebers.id, memberId)
        )

        res.json({
            success:true,
            message: "Member Removed"
        })
    } catch( error ) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// delete teamm
export async function deleteTeam(req, res) {
    const { teamId } = req.params
    const { id: userId } = req.user
    
    try {
        
        const [membership] = await db.select().from(teamMemebers)
            .where(
                and(
                    eq(teamMemebers.id, teamId),
                    eq(teamMemebers.userId, userId)
                )
            )
        if (!membership || membership.role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only the owner can delete team"
            })
        }

        await db.delete(teams).where(eq(teams.id, teamId))

        res.json({
            success:true,
            message: "Team deleted",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}