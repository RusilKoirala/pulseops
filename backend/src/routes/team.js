import express from "express"
import {authMiddleware} from  "../middleware/auth.js"

import { createTeam, listUserTeams, getTeam, inviteToTeam, removeTeamMember,updateTeamMemberRole, deleteTeam } from "../controllers/team.js"


const router = express.Router()

router.use(authMiddleware)

// CREATEEEE USER
router.post("/",createTeam);

// List of user teamss
router.get("/", listUserTeams)

// get team
router.get("/:teamId", getTeam)

// invite to teamm --JOIN my team :) 
router.post("/:teamId/invite", inviteToTeam)

// Update rolee (PROMOTTIONN AGAIN)
router.put("/:teamId/members/:memberId", updateTeamMemberRole)

// Remove user ( FIREEEE U )
router.delete("/:teamId/members/:memberId", removeTeamMember)

// Delete team ( Bankrupt XD )
router.delete("/:teamId", deleteTeam)

export default router