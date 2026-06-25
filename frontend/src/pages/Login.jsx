import { useState } from "react";
import {Link, useNavigate } from "react-router-dom"
import api from "../lib/api";
import { Button } from "@/components/ui/button"


import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function Login() {
    const [form , setform] = useState({ email: "", password: "" })
    const [error, seterror] = useState("")
    const [loading,setloading]= useState(false)
    const {setUser}= useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setloading(true)
        seterror("")

        try {
            const res = await api.post("/users/login", form)
            setUser(res.data.data)
            navigate("/dashboard")
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        }
        finally {
            setloading(false)
        }
    }

    return(
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
                <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
                <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setform({ ...form, email: e.target.value })}
                        required
                    />
                    <input
                        className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setform({ ...form, password: e.target.value })}
                        required
                    />
    
                    <Button type="submit" className="w-full mt-1" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>

                <p className="text-sm text-center text-muted-foreground mt-4">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-foreground underline underline-offset-2">Sign up</Link>
                </p>
            </div>
        </div>
    )
}