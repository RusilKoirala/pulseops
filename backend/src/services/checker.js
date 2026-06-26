import {eq} from 'drizzle-orm'
import db from '../lib/db.js'
import { monitorChecks, monitors } from '../db/schema.js'


export async function performHealthCheck(monitor) {
    const startTime = Date.now()
    let status = "down"
    let statuscode = null
    let responseTime = null

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(),10_000)
        const res = await fetch(monitor.url, { 
            signal: controller.signal,
            redirect: "follow"
        })
        clearTimeout(timeout)

        responseTime = Date.now() - startTime
        statuscode = res.status
        status = res.ok ? "up" : "down"
    }
    catch (error) {
      responseTime = Date.now() - startTime
    }
    
    // get prev check
    const [prev]= await db.select().from(monitorChecks)
        .where(eq(monitorChecks.monitorId,monitor.id))
        .orderBy(desc(monitorChecks.checkedAt))
        .limit(1)
    
     await db.insert(monitorChecks).values({ monitorId: monitor.id, status, responseTime })

  // send alert if status flipped and notifications are on
  if (monitor.notificationsEnabled && prev) {
    const [owner] = await db.select().from(user).where(eq(user.id, monitor.userId))
    if (owner) {
      if (prev.status === "up" && status === "down") {
        await sendDownAlert(owner.email, monitor.name, monitor.url)
      } else if (prev.status === "down" && status === "up") {
        await sendRecoveryAlert(owner.email, monitor.name, monitor.url)
      }
    }
  }
}

const activeTimers = new Map()

export async function startSchedular(monitor) {
    activeTimers.forEach((timer)=>clearInterval(timer))
    activeTimers.clear()

    const activeMonitors = await db.select().from(monitors)  


    for (const monitor of activeMonitors) { 
        performHealthCheck(monitor)

        const timer = setInterval(() => {
            performHealthCheck(monitor)
        },monitor.interval * 1000 )
        activeTimers.set(monitor.id, timer)
    }
}

export async function restartScheduler() {
    await startSchedular();
}

