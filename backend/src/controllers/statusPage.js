import { desc } from "drizzle-orm"
import { incidents, incidentUpdates, monitorChecks, monitors, statusPages } from "../db/schema"
import db from "../lib/db"


export const createStatusPage = async (req,res) => {
    try {
        const { monitorId, title, description, customDomain, logoUrl, primaryColor } = req.body
        const monitor = await db.query.monitors.findFirst({
            where: eq(monitors.id, monitorId)
        })

        if (!monitor || (monitor.userId !== req.user.id && !monitor.teamId)) {
            return res.status(403).json({
                error: "Not authorized"
            })
        }

        const [statusPage] = await db.insert(statusPages).values({
            monitorId,
            title,
            description,
            customDomain,
            primaryColor,
        }).returning()

        res.status(201).json({
            data: statusPage
        })
    } catch (error) {
        res.status(500).json({
            error: "Failed to create status page"
        })
    }
}

export const getStatusPage = async (req, res) => {
  try {
    const { id } = req.params
    
    const statusPage = await db.query.statusPages.findFirst({
      where: eq(statusPages.id, id),
      with: {
        monitor: true
      }
    })
    
    if (!statusPage) {
      return res.status(404).json({ error: "Status page not found" })
    }
     
    // get recent checks
    const checks = await db.query.monitorChecks.findMany({
      where: eq(monitorChecks.monitorId, statusPage.monitorId),
      orderBy: desc(monitorChecks.checkedAt),
      limit: 100
    })
    
    // get active incidents
    const activeIncidents = await db.query.incidents.findMany({
      where: and(
        eq(incidents.monitorId, statusPage.monitorId),
        eq(incidents.status, "investigating")
      ),
      with: {
        updates: {
          orderBy: desc(incidentUpdates.createdAt)
        }
      }
    })
    
    // calculate uptime :)
    const totalChecks = checks.length
    const upChecks = checks.filter(c => c.status === "up").length
    const uptime = totalChecks > 0 ? ((upChecks / totalChecks) * 100).toFixed(2) : 0
    
    res.json({ 
      data: {
        statusPage,
        checks,
        activeIncidents,
        uptime,
        currentStatus: checks[0]?.status || "unknown"
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch status page" })
  }
}


export const getStatusPagesByMonitor = async(req, res) => {
    try {
        const { monitorId } = req.params

        const pages = await db.query.statusPages.findMany({
            where: eq(statusPages.monitorId, monitorId)
        })

        res.json({data : pages})
    } catch (error) {
        res.status(500).json({
            error:"Failed to fetch status pages"
        })
    }
}

