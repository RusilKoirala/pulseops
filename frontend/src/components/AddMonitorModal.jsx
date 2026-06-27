import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Parse human input like "5m", "2h", "1d" into seconds
function parseInterval(value) {
  const str = value.trim().toLowerCase()
  const num = parseFloat(str)
  if (isNaN(num)) return null

  if (str.endsWith("d")) return Math.round(num * 86400)
  if (str.endsWith("h")) return Math.round(num * 3600)
  if (str.endsWith("m")) return Math.round(num * 60)
  if (str.endsWith("s")) return Math.round(num)

  // plain number = seconds
  return Math.round(num)
}

const PRESETS = [
  { label: "5m", seconds: 300 },
  { label: "15m", seconds: 900 },
  { label: "30m", seconds: 1800 },
  { label: "1h", seconds: 3600 },
  { label: "6h", seconds: 21600 },
  { label: "1d", seconds: 86400 },
]

export function AddMonitorModal({ monitor, onClose, onCreated, onUpdated }) {
  const isEdit = !!monitor
  
  const [form, setForm] = useState({ 
    name: monitor?.name || "", 
    url: monitor?.url || "", 
    notificationsEnabled: monitor?.notificationsEnabled ?? true, 
    teamId: monitor?.teamId || "" 
  })
  
  // Initialize interval input
  const [intervalInput, setIntervalInput] = useState(() => {
    if (monitor?.interval) {
      const seconds = monitor.interval
      if (seconds % 86400 === 0) return `${seconds / 86400}d`
      else if (seconds % 3600 === 0) return `${seconds / 3600}h`
      else return `${seconds / 60}m`
    }
    return "5m"
  })
  
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState([])

  async function fetchTeams() {
    try {
      const res = await api.get("/teams")
      setTeams(res.data.data)
    } catch (err) {
      // ignore
    }
  }

  function selectPreset(seconds) {
    // show back as human readable
    if (seconds % 86400 === 0) setIntervalInput(`${seconds / 86400}d`)
    else if (seconds % 3600 === 0) setIntervalInput(`${seconds / 3600}h`)
    else setIntervalInput(`${seconds / 60}m`)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Validate name
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }

    // Validate URL
    try {
      new URL(form.url)
    } catch {
      toast.error("Enter a valid URL (e.g. https://example.com)")
      return
    }
    if (!form.url.startsWith("http://") && !form.url.startsWith("https://")) {
      toast.error("URL must start with http:// or https://")
      return
    }

    // Validate interval
    const interval = parseInterval(intervalInput)
    if (!interval || isNaN(interval)) {
      toast.error("Enter a valid interval like 5m, 2h, or 1d")
      return
    }
    if (interval < 300) {
      toast.error("Minimum interval is 5 minutes (5m)")
      return
    }
    if (interval > 86400) {
      toast.error("Maximum interval is 24 hours (24h or 1d)")
      return
    }

    setLoading(true)
    try {
      const payload = { ...form, interval }
      if (!payload.teamId) delete payload.teamId
      
      if (isEdit) {
        // Edit mode: don't allow changing team
        delete payload.teamId
        await api.put(`/monitors/${monitor.id}`, payload)
        toast.success("Monitor updated!")
        onUpdated()
      } else {
        await api.post("/monitors", payload)
        toast.success("Monitor added!")
        onCreated()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-1">{isEdit ? "Edit Monitor" : "Add Monitor"}</h2>
        <p className="text-sm text-muted-foreground mb-4">We'll ping your URL on the interval you set.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Name (e.g. My API)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="URL (https://example.com)"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              required
            />
          </div>

          {!isEdit && teams.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Save to</label>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              >
                <option value="">My Personal</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              Check interval — use <span className="font-mono">5m</span>, <span className="font-mono">2h</span>, <span className="font-mono">1d</span> (min 5m)
            </label>
            {/* Preset buttons */}
            <div className="flex gap-2 mb-2 flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => selectPreset(p.seconds)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    intervalInput === p.label
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-border hover:border-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* Custom input */}
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring font-mono"
              placeholder="or type: 5m, 2h, 1d..."
              value={intervalInput}
              onChange={(e) => setIntervalInput(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between px-1 py-2">
            <div>
              <p className="text-sm font-medium">Email alerts</p>
              <p className="text-xs text-muted-foreground">Notify me when this monitor goes down or recovers</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.notificationsEnabled}
              onClick={() => setForm(f => ({ ...f, notificationsEnabled: !f.notificationsEnabled }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                form.notificationsEnabled ? "bg-green-500" : "bg-input"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                  form.notificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex gap-2 mt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save Changes" : "Add Monitor")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}