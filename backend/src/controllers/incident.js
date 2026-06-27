import  db  from "../lib/db.js"
import { incidents, incidentUpdates, monitors } from "../db/schema.js"
import { eq, desc, and } from "drizzle-orm"

export const createIncident = async (req, res) => {
  try {
    const { monitorId, title, description } = req.body
    
    const monitor = await db.select().from(monitors).where(eq(monitors.id, monitorId)).limit(1)
    
    if (monitor.length === 0) {
      return res.status(404).json({ error: "Monitor not found" })
    }
    
    const foundMonitor = monitor[0]
    
    if (foundMonitor.userId !== req.user.id && !foundMonitor.teamId) {
      return res.status(403).json({ error: "Not authorized" })
    }
    
    const [incident] = await db.insert(incidents).values({
      monitorId,
      title,
      description,
      status: "investigating"
    }).returning()
    
    res.status(201).json({ data: incident })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create incident" })
  }
}

export const getIncidentsByMonitor = async (req, res) => {
  try {
    const { monitorId } = req.params
    
    const incidentsList = await db.select().from(incidents).where(eq(incidents.monitorId, monitorId)).orderBy(desc(incidents.startedAt))
    
    res.json({ data: incidentsList })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch incidents" })
  }
}

export const updateIncident = async (req, res) => {
  try {
    const { id } = req.params
    const { status, message } = req.body
    
    const incidentResult = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1)
    
    if (incidentResult.length === 0) {
      return res.status(404).json({ error: "Incident not found" })
    }
    
    const incident = incidentResult[0]
    
    const monitorResult = await db.select().from(monitors).where(eq(monitors.id, incident.monitorId)).limit(1)
    const monitor = monitorResult[0]
    
    if (monitor.userId !== req.user.id && !monitor.teamId) {
      return res.status(403).json({ error: "Not authorized" })
    }
    
    const [updatedIncident] = await db.update(incidents)
      .set({ 
        status,
        ...(status === "resolved" && { resolvedAt: new Date() })
      })
      .where(eq(incidents.id, id))
      .returning()
    
    if (message) {
      await db.insert(incidentUpdates).values({
        incidentId: id,
        message,
        status
      })
    }
    
    res.json({ data: updatedIncident })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update incident" })
  }
}
