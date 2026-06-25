import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post("/users/signup", form)
      toast.success("Account created! Please sign in.")
      navigate("/login")
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">Create account</h1>
        <p className="text-sm text-muted-foreground mb-6">Start monitoring in seconds</p>

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
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" className="w-full mt-1" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline underline-offset-2">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
