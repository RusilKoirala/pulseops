

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/navbar"
import { Dashboard } from "@/pages/Dashboard"
import { Login } from "@/pages/Login"
import { Toaster } from "sonner"
import { MonitorDetail } from "@/pages/MonitorDetail"

import { Signup } from "./pages/Signup"
import { VerifyEmail } from "./pages/VerifyEmail"

function App() {
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors postition="top-right"/>
        <Navbar/> 
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
          <Route path="/verify-email" element={<VerifyEmail/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
