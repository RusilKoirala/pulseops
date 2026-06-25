

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/navbar"
import { Dashboard } from "@/pages/Dashboard"
import { Login } from "@/pages/Login"
import { Toaster } from "sonner"

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
          <Route path="/login" element={<Login/>}/>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
