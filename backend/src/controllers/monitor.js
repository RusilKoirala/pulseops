import {eq, desc, and, or, inArray} from "drizzle-orm"
import db from "../lib/db.js"
import { monitors, monitorChecks, teamMembers } from "../db/schema.js"
import { z } from "zod"
import { restartScheduler } from "../services/checker.js"
import { performHealthCheck } from "../services/checker.js"

const CreateMonitorSchema = z.object({
    name: z.string().min(1),
    url: z.string().url(),
    interval: z.number().min(300).max(86400),
    notificationsEnabled: z.boolean().default(true),
    teamId: z.string().optional(),
})

const UpdateMonitorSchema = z.object({
    name: z.string().min(1).optional(),
    url: z.string().url().optional(),
    interval: z.number().min(300).max(86400).optional(),
    notificationsEnabled: z.boolean().optional(),
})

async function ListAllMonitor(req, res) {
    const {id : userId } = req.user
    try {
        // Get all team IDs user is part of
        const userTeams = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId))
        const teamIds = userTeams.map(t => t.teamId)

        // Get personal monitors AND team monitors
        let allMonitors
        if (teamIds.length > 0) {
            allMonitors = await db.select().from(monitors)
                .where(or(
                    eq(monitors.userId, userId),
                    inArray(monitors.teamId, teamIds)
                ))
                .orderBy(desc(monitors.createdAt))
        } else {
            allMonitors = await db.select().from(monitors)
                .where(eq(monitors.userId, userId))
                .orderBy(desc(monitors.createdAt))
        }
        
        res.json({ success: true, data: allMonitors })  
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function UpdateMonitor(req, res) {
    const { id: userId} = req.user
    const { id } = req.params
    const updateData = UpdateMonitorSchema.parse(req.body)

    try {
        // Get monitor first
        const [monitor] = await db.select().from(monitors).where(eq(monitors.id, id))
        if (!monitor) return res.status(404).json({ success: false, message: "Monitor not found" })

        // Check access
        let hasAccess = monitor.userId === userId
        if (!hasAccess && monitor.teamId) {
            const [membership] = await db.select().from(teamMembers).where(
                and(eq(teamMembers.teamId, monitor.teamId), eq(teamMembers.userId, userId))
            )
            hasAccess = !!membership
        }

        if (!hasAccess) return res.status(403).json({ success: false, message: "Not authorized" })

        const [updatedMonitor] = await db.update(monitors).set(updateData).where(eq(monitors.id, id)).returning()
        res.json({ success: true, data: updatedMonitor })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
    await restartScheduler()
}

async function DeleteMonitor(req, res) {
    const { id: userId} = req.user
    const { id } = req.params

    try {
        // Get monitor first
        const [monitor] = await db.select().from(monitors).where(eq(monitors.id, id))
        if (!monitor) return res.status(404).json({ success: false, message: "Monitor not found" })

        // Check access
        let hasAccess = monitor.userId === userId
        if (!hasAccess && monitor.teamId) {
            const [membership] = await db.select().from(teamMembers).where(
                and(eq(teamMembers.teamId, monitor.teamId), eq(teamMembers.userId, userId))
            )
            hasAccess = !!membership
        }

        if (!hasAccess) return res.status(403).json({ success: false, message: "Not authorized" })

        const deletedMonitor = await db.delete(monitors).where(eq(monitors.id, id))
        res.json({ success: true, data: deletedMonitor })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
    await restartScheduler()
}

async function CreateMonitor(req, res) {
    const { name, url, interval, notificationsEnabled, teamId } = CreateMonitorSchema.parse(req.body)
    const { id: userId} = req.user
    try {
        let monitorData = { name, url, interval, notificationsEnabled }
        
        if (teamId) {
            // Check if user is in team
            const [membership] = await db.select().from(teamMembers).where(
                and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
            )
            if (!membership) {
                return res.status(403).json({ success: false, message: "Not a team member" })
            }
            monitorData.teamId = teamId
        } else {
            monitorData.userId = userId
        }

        const [newMonitor] = await db.insert(monitors).values(monitorData).returning()
        res.status(201).json({ success: true, data: newMonitor })
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
    await restartScheduler()
}

async function ListMonitorChecks(req, res) {
    const { id } = req.params

    try {
        const checks = await db.select().from(monitorChecks).where(eq(monitorChecks.monitorId, id)).orderBy(desc(monitorChecks.checkedAt)).limit(50)
        res.json({ success: true, data: checks })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function MonitorStatus(req, res) {
    const { id } = req.params

    try {
        const checks = await db.select().from(monitorChecks)
            .where(eq(monitorChecks.monitorId, id))
            .orderBy(desc(monitorChecks.checkedAt))
            .limit(100)

        if (checks.length === 0) {
            return res.json({ success: true, data: { uptime: null, avgResponseTime: null, lastChecked: null } })
        }

        const upCount = checks.filter(c => c.status === "up").length
        const uptime = ((upCount / checks.length) * 100).toFixed(2)
        const avgResponseTime = Math.round(
            checks.reduce((sum, c) => sum + Number(c.responseTime), 0) / checks.length
        )

        res.json({
            success: true,
            data: {
                uptime: `${uptime}%`,
                avgResponseTime: `${avgResponseTime}ms`,
                lastChecked: checks[0].checkedAt,
                totalChecks: checks.length,
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function ManualCheck(req, res) {
    const { id } = req.params
    try {
        const [monitor] = await db.select().from(monitors).where(eq(monitors.id, id))
        if (!monitor) return res.status(404).json({ success: false, message: "Monitor not found" })
        await performHealthCheck(monitor)
        res.json({ success: true, message: "Check triggered" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export {
    ListAllMonitor,
    UpdateMonitor,
    DeleteMonitor,
    CreateMonitor,
    ListMonitorChecks,
    MonitorStatus, 
    ManualCheck
}