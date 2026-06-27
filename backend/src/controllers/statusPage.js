import db  from "../lib/db.js"
import { statusPages, incidents, incidentUpdates, monitors, monitorChecks } from "../db/schema.js"
import { eq, desc, and } from "drizzle-orm"

export const createStatusPage = async (req, res) => {
  try {
    const { monitorId, title, description, customDomain, logoUrl, primaryColor } = req.body
    
    const monitor = await db.select().from(monitors).where(eq(monitors.id, monitorId)).limit(1)
    
    if (monitor.length === 0) {
      return res.status(404).json({ error: "Monitor not found" })
    }
    
    const foundMonitor = monitor[0]
    
    if (foundMonitor.userId !== req.user.id && !foundMonitor.teamId) {
      return res.status(403).json({ error: "Not authorized" })
    }
    
    const [statusPage] = await db.insert(statusPages).values({
      monitorId,
      title,
      description,
      customDomain,
      logoUrl,
      primaryColor
    }).returning()
    
    res.status(201).json({ data: statusPage })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create status page" })
  }
}

export const getStatusPage = async (req, res) => {
  try {
    const { id } = req.params
    
    const pageResult = await db.select().from(statusPages).where(eq(statusPages.id, id)).limit(1)
    
    if (pageResult.length === 0) {
      return res.status(404).json({ error: "Status page not found" })
    }
    
    const statusPage = pageResult[0]
    
    const monitorResult = await db.select().from(monitors).where(eq(monitors.id, statusPage.monitorId)).limit(1)
    const monitor = monitorResult[0]
    
    const checks = await db.select().from(monitorChecks).where(eq(monitorChecks.monitorId, statusPage.monitorId)).orderBy(desc(monitorChecks.checkedAt)).limit(100)
    
    const activeIncidents = await db.select().from(incidents).where(and(
      eq(incidents.monitorId, statusPage.monitorId),
      eq(incidents.status, "investigating")
    )).orderBy(desc(incidents.startedAt))
    
    const totalChecks = checks.length
    const upChecks = checks.filter(c => c.status === "up").length
    const uptime = totalChecks > 0 ? ((upChecks / totalChecks) * 100).toFixed(2) : 0
    
    res.json({ 
      data: {
        statusPage: { ...statusPage, monitor },
        checks,
        activeIncidents,
        uptime,
        currentStatus: checks[0]?.status || "unknown"
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch status page" })
  }
}

export const getStatusPagesByMonitor = async (req, res) => {
  try {
    const { monitorId } = req.params
    
    const pages = await db.select().from(statusPages).where(eq(statusPages.monitorId, monitorId))
    
    res.json({ data: pages })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch status pages" })
  }
}
