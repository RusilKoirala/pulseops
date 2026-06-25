import { useState } from "react"
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

export function AddMonitorModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", url: "" })
  const [intervalInput, setIntervalInput] = useState("5m")
  const [loading, setLoading] = useState(false)

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
      await api.post("/monitors", { ...form, interval })
      toast.success("Monitor added!")
      onCreated()
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-1">Add Monitor</h2>
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

          <div className="flex gap-2 mt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Monitor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
