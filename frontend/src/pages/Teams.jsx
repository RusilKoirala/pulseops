import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Plus, Users, Trash2, Settings } from "lucide-react"

export function Teams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  async function fetchTeams() {
    try {
      const res = await api.get("/teams")
      setTeams(res.data.data)
    } catch (err) {
      toast.error("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return (
    <div className="min-h-screen bg-background pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Teams</h1>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : teams.length === 0 ? (
          <p className="text-muted-foreground">No teams yet. Create one to collaborate!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{team.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/teams/${team.id}`}>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchTeams() }}
        />
      )}
    </div>
  )
}

function CreateTeamModal({ onClose, onCreated }) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Team name is required")
      return
    }

    setLoading(true)
    try {
      await api.post("/teams", { name })
      toast.success("Team created!")
      onCreated()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create team")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-1">Create Team</h2>
        <p className="text-sm text-muted-foreground mb-4">Invite members to collaborate on monitors.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}