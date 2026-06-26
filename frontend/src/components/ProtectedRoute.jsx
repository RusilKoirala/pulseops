import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
    const {user,loading} = useAuth()

    if (loading){
        return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>
    }
    if (!user){
        return <Navigate to="/login"/>
    }
    if (!user.isVerified) {
        return <Navigate to="/verify-email"/>
    }
    return children
}