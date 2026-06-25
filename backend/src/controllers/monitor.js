import {eq, desc} from "drizzle-orm"
import db from "../lib/db.js"

import { monitors, monitorChecks } from "../db/schema.js"
import { z } from "zod"
import { restartScheduler } from "../services/checker.js"

const CreateMonitorSchema = z.object({
    name: z.string().min(1),
    url: z.string().url(),
    interval: z.number().min(30).max(86400),  
})


async function ListAllMonitor(req, res) {
    try {
        const allMonitors = await db.select().from(monitors).orderBy(desc(monitors.createdAt))
        res.json({ success: true, data: allMonitors })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


async function DeleteMonitor(req, res) {
    const { id } = req.params

    try {
        const deletedMonitor = await db.delete(monitors).where(eq(monitors.id, id)).returning()
        await restartScheduler()
        res.json({ success: true, data: deletedMonitor })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


async function CreateMonitor(req, res) {
    const { name, url, interval } = CreateMonitorSchema.parse(req.body)
    try {
        const [newMonitor] = await db.insert(monitors).values({ name, url }).returning()
        await restartScheduler()
        res.status(201).json({ success: true, data: newMonitor })
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
  
}


async function ListMonitorChecks(req, res) {
    const { id } = req.params

    try {
        const checks = await db.select().from(monitorChecks).where(eq(monitorChecks.monitorId, id)).orderBy(desc(monitorChecks.checkedAt)).limit(10)
        res.json({ success: true, data: checks })

    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

async function MonitorCheck(req, res) {
    const { id } = req.params

    try {
        const check = await db.select().from(monitorChecks).where(eq(monitorChecks.monitorId, id)).orderBy(desc(monitorChecks.checkedAt)).limit(1)
        await restartScheduler()
        res.json({ success: true, data: check })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


export {
    ListAllMonitor,
    DeleteMonitor,
    CreateMonitor,
    ListMonitorChecks,
    MonitorCheck
}