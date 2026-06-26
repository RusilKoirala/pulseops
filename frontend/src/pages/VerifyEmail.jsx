import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"

export function VerifyEmail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState("loading") // loading | success | error | pending
  const [message, setMessage] = useState("")
  const [resending, setResending] = useState(false)
  const token = params.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("pending")
      return
    }
    api.get(`/users/verify-email?token=${token}`)
      .then(() => {
        setStatus("success")
        setTimeout(() => navigate("/dashboard"), 2000)
      })
      .catch(err => {
        setStatus("error")
        setMessage(err.response?.data?.message || "Invalid or expired link")
      })
  }, [token])

  async function resend() {
    setResending(true)
    setMessage("")
    try {
      await api.post("/users/resend-verification")
      setMessage("Email sent! Check your inbox.")
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend")
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
            <p className="text-2xl mb-2">✅</p>
            <p className="font-semibold text-green-500">Email verified!</p>
            <p className="text-sm text-muted-foreground mt-1">Redirecting to dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-2xl mb-2">❌</p>
            <p className="font-semibold text-red-500 mb-1">{message}</p>
            <p className="text-sm text-muted-foreground mb-4">Request a new verification link below.</p>
            {message && <p className="text-sm text-green-500 mb-3">{message}</p>}
            <Button variant="outline" onClick={resend} disabled={resending} className="w-full">
              {resending ? "Sending..." : "Resend verification email"}
            </Button>
          </>
        )}

        {status === "pending" && (
          <>
            <p className="text-2xl mb-2">📬</p>
            <h2 className="text-lg font-semibold mb-1">Check your inbox</h2>
            <p className="text-sm text-muted-foreground mb-4">
              We sent a verification link to your email. Click it to activate your account.
            </p>
            {message && <p className="text-sm text-green-500 mb-3">{message}</p>}
            <Button variant="outline" onClick={resend} disabled={resending} className="w-full">
              {resending ? "Sending..." : "Resend email"}
            </Button>
          </>
        )}

      </div>
    </div>
  )
}
