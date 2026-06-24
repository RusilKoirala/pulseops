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
        status = "down"
    }
    await db.insert(monitorChecks).values({
        monitorId: monitor.id,
        status,
        statuscode,
        responseTime
    })
  console.log(`Checked ${monitor.name} - Status: ${status}, Status Code: ${statuscode}, Response Time: ${responseTime}ms`)
}

const activeTimers = new Map()

export async function startSchedular(monitor) {
    activeTimers.forEach((timer)=>clearInterval(timer))
    activeTimers.clear()

    const activeMonitors = await db.select().from(monitors).where(monitors.isActive, true)

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