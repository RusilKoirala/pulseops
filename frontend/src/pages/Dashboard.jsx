import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { MonitorCard } from "@/components/MonitorCard"
import { AddMonitorModal } from "@/components/AddMonitorModal"

export function Dashboard() {
  const [monitors, setMonitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function fetchMonitors() {
    try {
      const res = await api.get("/monitors")
      setMonitors(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function deleteMonitor(id) {
    await api.delete(`/monitors/${id}`)
    fetchMonitors()
  }

  useEffect(() => {
    fetchMonitors()
    const interval = setInterval(fetchMonitors, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Monitors</h1>
          <Button onClick={() => setShowModal(true)}>+ Add Monitor</Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : monitors.length === 0 ? (
          <p className="text-muted-foreground">No monitors yet. Add one to get started.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {monitors.map((monitor) => (
              <MonitorCard
                key={monitor.id}
                monitor={monitor}
                onDelete={() => deleteMonitor(monitor.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddMonitorModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchMonitors() }}
        />
      )}
    </div>
  )
}
