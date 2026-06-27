import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import api from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, Trash2, UserPlus, Shield, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TeamDetail() {
    const { teamId } = useParams()
    const navigate = useNavigate()
    const [team, setTeam] = useState(null)
    const [members, setMembers] = useState([])
    const [currentRole, setCurrentRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showInviteModal, setShowInviteModal] = useState(false)

    async function fetchTeam() {
        try {
            const res = await api.get(`/teams/${teamId}`)
            setTeam(res.data.data.team)
            setMembers(res.data.data.members)
            setCurrentRole(res.data.data.currentUserRole)
        } catch (error) {
            toast.error("Failed to load team")
            navigate("/teams")
        } finally {
            setLoading(false)
        }
    }

    async function deleteTeam() {
        if (!confirm("Delete this team? This cannot be undone.")) return
        try {
            await api.delete(`/teams/${teamId}`)
            toast.success("Team Deleted")
            navigate("/teams")
        } catch (error) {
            toast.error("Failed to delete team")
        }
    }

    useEffect(() => {
        fetchTeam()
    }, [teamId])

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pt-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/teams" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {team?.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {members.length} members
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {["owner", "admin"].includes(currentRole) && (
                            <Button size="sm" onClick={() => setShowInviteModal(true)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Invite Member
                            </Button>
                        )}
                        {currentRole === "owner" && (
                            <Button size="sm" variant="destructive" onClick={deleteTeam}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Team
                            </Button>
                        )}
                    </div>
                </div>

                <div className="border rounded-xl bg-card">
                    <div className="p-4 border-b bg-muted/30">
                        <p className="font-medium">Members</p>
                    </div>
                    <div className="divide-y">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        member.role === "owner" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                                        member.role === "admin" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                                        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                                    }`}>
                                        <Shield className="w-3 h-3 inline mr-1" />
                                        {member.role}
                                    </span>
                                    {["owner", "admin"].includes(currentRole) && member.role !== "owner" && (
                                        <MemberActions
                                            member={member}
                                            teamId={teamId}
                                            currentRole={currentRole}
                                            onUpdate={fetchTeam}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showInviteModal && (
                <InviteMemberModal
                    teamId={teamId}
                    onClose={() => setShowInviteModal(false)}
                    onInvited={() => {
                        setShowInviteModal(false)
                        fetchTeam()
                    }}
                />
            )}
        </div>
    )
}

function MemberActions({ member, teamId, currentRole, onUpdate }) {
    const [showRoleMenu, setShowRoleMenu] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowRoleMenu(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    async function updateRole(newRole) {
        try {
            await api.put(`/teams/${teamId}/members/${member.id}`, { role: newRole })
            toast.success("Roles updated")
            onUpdate()
        } catch (error) {
            toast.error("Failed to update member")
        }
    }
    async function removeMember() {
        if (!confirm(`Remove ${member.name} from team?`)) return

        try {
            await api.delete(`/teams/${teamId}/members/${member.id}`)
            toast.success("Member removed")
            onUpdate()
        } catch (error) {
            toast.error("Failed to remove member")
        }
    }
    return (
        <div className="relative" ref={menuRef}>
            <Button size="sm" variant="ghost" onClick={() => setShowRoleMenu(!showRoleMenu)}>
                <MoreVertical className="w-4 h-4" />
            </Button>
            {showRoleMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-lg z-50 overflow-hidden">
                    {currentRole === "owner" && (
                        <>
                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => { updateRole("admin"); setShowRoleMenu(false) }}
                                disabled={member.role === "admin"}
                            >
                                Make Admin
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => { updateRole("member"); setShowRoleMenu(false) }}
                                disabled={member.role === "member"}
                            >
                                Make Member
                            </button>
                        </>
                    )}
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => { removeMember(); setShowRoleMenu(false) }}>
                        <Trash2 className="w-4 h-4 inline mr-2" />
                        Remove
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted border-t"
                        onClick={() => setShowRoleMenu(false)}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    )
}

function InviteMemberModal({ teamId, onClose, onInvited }) {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("member")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (!email.trim()) {
            toast.error("Email is required")
            return
        }
        setLoading(true)

        try {
            await api.post(`/teams/${teamId}/invite`, { email, role })
            toast.success("Member Invited!")
            onInvited()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to invite member")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
                <h2 className="text-lg font-semibold mb-1">Invite Member</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Invite someone to join your team
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input type="email"
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">
                            Role
                        </label>
                        <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? "Inviting..." : "Invite"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}