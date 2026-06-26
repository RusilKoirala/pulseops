import { useEffect, useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

export function VerifyEmail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [status, setStatus] = useState("loading")
  const [resending, setResending] = useState(false)
  const token = params.get("token")

  useEffect(() => {
    // already verified — skip straight to dashboard
    if (user?.isVerified) {
      navigate("/dashboard", { replace: true })
      return
    }

    if (!token) {
      setStatus("pending")
      return
    }

    api.get(`/users/verify-email?token=${token}`)
      .then(() => {
        setStatus("success")
        toast.success("Email verified! Redirecting...")
        setTimeout(() => navigate("/dashboard"), 1500)
      })
      .catch(err => {
        setStatus("error")
        toast.error(err.response?.data?.message || "Invalid or expired link")
      })
  }, [token, user])

  async function resend() {
    setResending(true)
    try {
      await api.post("/users/resend-verification")
      toast.success("Verification email sent! Check your inbox.")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend email")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full rounded-2xl border bg-card p-8 text-center">

        {status === "loading" && (
          <p className="text-muted-foreground">Verifying...</p>
        )}

        {status === "success" && (
          <>
            <p className="font-semibold text-green-500">Email verified!</p>
            <p className="text-sm text-muted-foreground mt-1">Redirecting to dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Request a new verification link below.
            </p>
            <Button variant="outline" onClick={resend} disabled={resending} className="w-full">
              {resending ? "Sending..." : "Resend verification email"}
            </Button>
          </>
        )}

        {status === "pending" && (
          <>
            <p className="text-2xl mb-2">📬</p>
            <h2 className="text-lg font-semibold mb-1">Check your inbox</h2>
            <p className="text-sm text-muted-foreground mb-3">
              We sent a verification link to your email. Click it to activate your account.
            </p>
            <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2.5 mb-4 text-left">
              <span className="text-yellow-500 text-sm mt-0.5">⚠</span>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Can't find it? Check your spam or junk folder.
              </p>
            </div>
            <Button variant="outline" onClick={resend} disabled={resending} className="w-full mb-4">
              {resending ? "Sending..." : "Resend email"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Not getting emails?{" "}
              <Link to="/demo" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Try the demo instead
              </Link>
            </p>
          </>
        )}

      </div>
    </div>
  )
}
