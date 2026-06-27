import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from "@/lib/api"
import { X, ExternalLink } from "lucide-react"

export function StatusPageSettings({ monitor, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    title: monitor.name,
    description: "",
    customDomain: "",
    logoUrl: "",
    primaryColor: "#3b82f6"
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post("/status-pages", {
        monitorId: monitor.id,
        ...formData
      })
      toast.success("Status page created!")
      onCreated()
      onClose()
    } catch (error) {
      toast.error("Failed to create status page")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Status Page</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <input
              type="text"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Logo URL</label>
            <input
              type="url"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Primary Color</label>
            <input
              type="color"
              className="w-full h-10 rounded-lg border bg-background"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
            />
          </div>
          
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
