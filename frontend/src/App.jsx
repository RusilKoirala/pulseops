

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
        // Dashboard Route
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
          }
        />
        // Montior by ID route
        <Route path="/monitors/:id" element={
          <ProtectedRoute>
            <MonitorDetail/>
          </ProtectedRoute>
        }/>

        // Settings route
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        // Teams route
        <Route path="/teams" element={
          <ProtectedRoute>
            <Teams/>
          </ProtectedRoute>
          }/>
        
        // Teams by id route
        <Route path="/teams/:teamId" element={
          <ProtectedRoute>
            <TeamDetail/>
          </ProtectedRoute>
          }/>
        
        // Verify Email route
        <Route path="/verify-email" element={<VerifyEmail/>}/>

        // Demo route
        <Route path="/demo" element={<Demo/>}/>

        // Sign up route
        <Route path="/signup" element={<Signup/>}/>

        // Login route
        <Route path="/login" element={<Login/>}/>

        // Status route by id
        <Route path="/status/:id" element={<StatusPage />} />

        // Landing Page route
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
