import { Button } from "@/components/ui/button"
import { ModeSwitcher } from "@/components/ui/theme-toggle"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.success("Logged out")
    navigate("/login")
  }

  return (
    <header className="fixed top-3 z-50 w-full px-3">
      <div className="mx-auto flex h-12 w-full max-w-4xl items-center bg-background/70 justify-between rounded-full border pr-2 pl-4 shadow-sm backdrop-blur">
        <Link to={user ? "/dashboard" : "/login"} className="text-lg font-semibold tracking-tight">
          PulseOps
        </Link>
        <div className="flex items-center gap-1.5">
          <ModeSwitcher />
          {user ? (
            <>
              <Link to="/dashboard">
                <Button size="sm" variant="ghost" className="rounded-full">Dashboard</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/signup">
                <Button size="sm" className="rounded-full">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
