import { useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"

export function AddMonitorModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", url: "", interval: 600 })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.post("/monitors", {
        ...form,
        interval: Number(form.interval),
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Add Monitor</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="URL (https://example.com)"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
          />
          <input
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Interval (seconds)"
            type="number"
            value={form.interval}
            onChange={(e) => setForm({ ...form, interval: e.target.value })}
            min={30}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
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
