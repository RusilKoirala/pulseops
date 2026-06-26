import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

import { Button } from "@/components/ui/button"
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";


export function Settings() {


    const {user, logout} = useAuth()
    const [pwForm, setPwForm] = useState({currentPassword: "", newPassword: "", confirmPassword: ""})
    const [pwLoading, setLoading] = useState(false)

    
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        navigate("/login")
    }

    async function handleChangePassword(e) {
        e.preventDefault()
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            toast.error("New passwords don't match :)")
            return
        }
        setLoading(true)
        try {
            await api.put("/users/password", {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            })
            toast.success("Password updated")
            setPwForm({currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password")
        } finally {
            setLoading(false)
        }
    }

    return(
    <div className="min-h-screen bg-background pt-24 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Go user goo */}
        <div className="rounded-2xl border bg-card px-6 py-5">
            <h2 className="font-semibold mb-1">Session</h2>
            <p className="text-sm text-muted-foreground mb-4">You are signed in as {user?.email}</p>
            <Button variant="outline" onClick={handleLogout}>
                Log out
            </Button>
        </div>

        {/* account Info */}
        <div className="rounded-2xl border bg-card px-6 py-5">
          <h2 className="font-semibold mb-4">Account</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{user?.name}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Email verified</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                user?.isVerified
                  ? "bg-green-500/10 text-green-500"
                  : "bg-yellow-500/10 text-yellow-500"
              }`}>
                {user?.isVerified ? "Verified" : "Unverified"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="text-sm font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* cccchange Password */}
        <div className="rounded-2xl border bg-card px-6 py-5">
          <h2 className="font-semibold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Current password"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={pwForm.newPassword}
              onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              required
            />
            <Button type="submit" disabled={pwLoading} className="w-full mt-1">
              {pwLoading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </div>

        {/* daaaanger Zone */}
        <div className="rounded-2xl border border-red-500/20 bg-card px-6 py-5">
          <h2 className="font-semibold text-red-500 mb-1">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all monitors. This cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => toast.error("Are you sure? This feature needs a confirmation dialog first.")}
          >
            Delete account
          </Button>
        </div>

      </div>
    </div>
    )
}