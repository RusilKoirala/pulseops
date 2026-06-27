import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"

export function MonitorCard({ monitor, onDelete, onEdit, refreshKey }) {
  const [lastCheck, setLastCheck] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchLastCheck() {
      try {
        const res = await api.get(`/monitors/${monitor.id}/checks`)
        const checks = res.data.data
        if (checks.length > 0) setLastCheck(checks[0])
      } catch (err) {}
    }
    fetchLastCheck()
  }, [monitor.id, refreshKey])

  const isUp = lastCheck?.status === "up"

  return (
    <div className="flex items-center justify-between rounded-xl border bg-card px-5 py-4">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate(`/monitors/${monitor.id}`)}
      >
        <span className={`size-3 rounded-full ${lastCheck ? (isUp ? "bg-green-500" : "bg-red-500") : "bg-gray-400"}`} />
        <div>
          <p className="font-medium">{monitor.name}</p>
          <p className="text-sm text-muted-foreground">{monitor.url}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {lastCheck && (
          <div className="text-right text-sm text-muted-foreground">
            <p>{isUp ? "Up" : "Down"} {lastCheck.responseTime}ms</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </div>
  )
}
