

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/navbar"
import { Dashboard } from "@/pages/Dashboard"
import { Login } from "@/pages/Login"
import { Toaster } from "sonner"
import { MonitorDetail } from "@/pages/MonitorDetail"
import { Settings } from "@/pages/Settings"
import { Signup } from "./pages/Signup"
import { VerifyEmail } from "./pages/VerifyEmail"
import { Demo } from "./pages/Demo"
import { Landing } from "./pages/Landing"
import { Teams } from "./pages/Teams"
import { TeamDetail } from "./pages/TeamDetail"
import { StatusPage } from "./pages/StatusPage"

function AppContent() {
  const location = useLocation()
  const isStatusPage = location.pathname.startsWith("/status/")
  
  return (
    <AuthProvider>
      <Toaster richColors postition="top-right"/>
      {!isStatusPage && <Navbar/>}
      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
          }
        />
        <Route path="/monitors/:id" element={
          <ProtectedRoute>
            <MonitorDetail/>
          </ProtectedRoute>
        }/>
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/teams" element={
          <ProtectedRoute>
            <Teams/>
          </ProtectedRoute>
          }/>
        <Route path="/teams/:teamId" element={
          <ProtectedRoute>
            <TeamDetail/>
          </ProtectedRoute>
          }/>
        <Route path="/verify-email" element={<VerifyEmail/>}/>
        <Route path="/demo" element={<Demo/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/status/:id" element={<StatusPage />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </AuthProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
