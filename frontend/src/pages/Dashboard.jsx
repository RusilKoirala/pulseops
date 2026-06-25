import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { MonitorCard } from "@/components/MonitorCard"
import { AddMonitorModal } from "@/components/AddMonitorModal"
import { toast } from "sonner"

export function Dashboard() {
  const [monitors, setMonitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  async function fetchMonitors(silent = false) {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await api.get("/monitors")
      setMonitors(res.data.data)
      setRefreshKey(k => k + 1) // tell cards to refetch
    } catch (err) {
      toast.error("Failed to load monitors")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function deleteMonitor(id) {
    try {
      await api.delete(`/monitors/${id}`)
      toast.success("Monitor deleted")
      fetchMonitors(true)
    } catch (err) {
      toast.error("Failed to delete monitor")
    }
  }

  useEffect(() => {
    fetchMonitors()
    const interval = setInterval(() => fetchMonitors(true), 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Monitors</h1>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchMonitors(true)}
              disabled={refreshing} 
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button size="sm" onClick={() => setShowModal(true)}>+ Add Monitor</Button>
          </div>
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
                refreshKey={refreshKey}
                onDelete={() => deleteMonitor(monitor.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddMonitorModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchMonitors(true) }}
        />
      )}
    </div>
  )
}
