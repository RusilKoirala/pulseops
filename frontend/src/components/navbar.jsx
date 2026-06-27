import { Button } from "@/components/ui/button"
import { ModeSwitcher } from "@/components/ui/theme-toggle"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { Settings, Users, User, LogOut, Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  async function handleLogout() {
    await logout()
    toast.success("Logged out")
    navigate("/login")
    setShowMenu(false)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="fixed top-3 z-50 w-full px-3">
      <div className="mx-auto flex h-12 w-full max-w-4xl items-center bg-background/70 justify-between rounded-full border pr-2 pl-4 shadow-sm backdrop-blur">
        <Link to={user ? "/dashboard" : "/login"} className="text-lg font-semibold tracking-tight">
          PulseOps
        </Link>
        <div className="flex items-center gap-1.5">
          <ModeSwitcher />
          {user ? (
            <div className="relative" ref={menuRef}>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => setShowMenu(!showMenu)}
              >
                {showMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border bg-card shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium">
                      {user.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/teams"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <Users className="w-4 h-4" />
                      Teams
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>
                  
                  <div className="border-t py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-muted transition-colors text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/demo">
                <Button size="sm" variant="outline" className="rounded-full">
                  Try Demo
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-full">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
