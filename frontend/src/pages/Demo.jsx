import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export function Demo() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(3)



  async function handleDemo() {
    if (loading) return
    setLoading(true)
    try {
      const res = await api.post("/users/demo")
      setUser(res.data.data)
      navigate("/dashboard")
    } catch (error) {
      toast.error("Failed to load demo account")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">

        <div className="flex items-center gap-2 mb-1">
          <span className="size-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Demo mode</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">Try PulseOps</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Logging you in with a demo account. No sign up needed.
        </p>

        {/* pre-filled form — read only, just for show */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            demo@pulseops.dev
          </div>
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground tracking-widest">
            ••••••••
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleDemo}
          disabled={loading}
        >
          Sign in
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          This is a shared demo account. Don't store sensitive data.
        </p>
      </div>
    </div>
  )
}
