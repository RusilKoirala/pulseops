import db from "../lib/db"
import { incidents, incidentUpdates, monitors } from "../db/schema.js"
import { eq, desc, and } from "drizzle-orm"

export const createIncident = async (req, res) => {
  try {
    const { monitorId, title, description } = req.body
    
    const monitor = await db.query.monitors.findFirst({
      where: eq(monitors.id, monitorId)
    })
    
    if (!monitor || (monitor.userId !== req.user.id && !monitor.teamId)) {
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
    res.status(500).json({ error: "Failed to create incident" })
  }
}

export const getIncidentsByMonitor = async (req, res) => {
  try {
    const { monitorId } = req.params
    
    const incidentsList = await db.query.incidents.findMany({
      where: eq(incidents.monitorId, monitorId),
      orderBy: desc(incidents.startedAt),
      with: {
        updates: {
          orderBy: desc(incidentUpdates.createdAt)
        }
      }
    })
    
    res.json({ data: incidentsList })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch incidents" })
  }
}

export const updateIncident = async (req, res) => {
  try {
    const { id } = req.params
    const { status, message } = req.body
    
    const incident = await db.query.incidents.findFirst({
      where: eq(incidents.id, id),
      with: {
        monitor: true
      }
    })
    
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" })
    }
    
    if (incident.monitor.userId !== req.user.id && !incident.monitor.teamId) {
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
    res.status(500).json({ error: "Failed to update incident" })
  }
}