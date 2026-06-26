import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../lib/api";
import {Button} from "@/components/ui/button"
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"


export function MonitorDetail() {
    const {id}= useParams()
    const navigate = useNavigate()


    const [monitor, setMonitor]= useState(null)
    const [status, setStatus] = useState(null)
    const [checks, setChecks]= useState([])
    const [loading, setLoading] = useState(true)
    const [checking, setChecking] = useState(false)

    const chartConfig = {
        responseTime: {
          label: "Response Time",
          color: "var(--chart-1)"
        }
    }
    

    function formatInterval(seconds) {
      if (seconds >= 86400) return `${seconds / 86400}d`
      if (seconds >= 3600) return `${seconds / 3600}h`
      if (seconds >= 60) return `${seconds / 60}m`
      return `${seconds}s`
    }

    async function fetchAll() {
        try {
            const [monitorRes,statusRes, checkRes]= await Promise.all([
                api.get("/monitors"),
                api.get(`/monitors/${id}/status`),
                api.get(`/monitors/${id}/checks`),
            ])
            const found = monitorRes.data.data.find(m=>m.id===id)
            setMonitor(found)
            setStatus(statusRes.data.data)
            setChecks(checkRes.data.data)
        } catch (error) {
            toast.error("Failed to load monitor")
        } finally {
            setLoading(false)
        }
    }
    async function trigger() {
        setChecking(true)
        try {
            await api.post(`/monitors/${id}/check`)
            toast.success("Check triggered")
            await fetchAll()
        } catch (error) {
            toast.error("Failed to trigger check")
        }
        finally {
            setChecking(false)
        }
    }
    useEffect(()=> {
        fetchAll()
    },[id])

    if (loading) return ( 
        <div className="min-h-screen flex items-center justify-center text-muted-foreground pt-20">
            Loading...
        </div>
    )
    const isUp = checks[0]?.status === "up"

    const chartData = [...checks]
      .reverse()
      .map((check, i)=> ({
        index:i+1,
        time: new Date(check.checkedAt).toLocaleDateString([], { hour:"2-digit", minute:"2-digit"}),
        responseTime: check.status === "up" ? Number(check.responseTime) : null,
      }))

     return (
        <div className="min-h-screen bg-background pt-24 px-4">
            <div className="max-w-4xl mx-auto">

             <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                 >
                    Back
                </button>
          <Button size="sm" onClick={trigger} disabled={checking}>
            {checking ? "Checking..." : "Check now"}
          </Button>
        </div>


        <div className="rounded-2xl border bg-card px-6 py-5 mb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className={`size-3 rounded-full ${checks.length > 0 ? (isUp ? "bg-green-500" : "bg-red-500") : "bg-gray-400"}`} />
            <h1 className="text-xl font-bold">{monitor.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{monitor.url}</p>
        </div>

   
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className={`text-lg font-semibold ${checks.length === 0 ? "text-muted-foreground" : isUp ? "text-green-500" : "text-red-500"}`}>
              {checks.length === 0 ? "No data" : isUp ? "Up" : "Down"}
            </p>
          </div>
          <div className="rounded-2xl border bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Uptime</p>
            <p className="text-lg font-semibold">{status?.uptime ?? "—"}</p>
          </div>
          <div className="rounded-2xl border bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Avg Response</p>
            <p className="text-lg font-semibold">{status?.avgResponseTime ?? "—"}</p>
          </div>
        </div>


        {chartData.length > 1 && (
          <div className="rounded-2xl border bg-card px-6 py-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Response Time</h2>
                <span className="text-xs text-muted-foreground">Last {checks.length} checks</span>
              </div>

              <ChartContainer config={chartConfig}>
                  <LineChart accessibilityLayer data={chartData} margin={{left: 8, right: 8}}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{fontSize:11}}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{fontSize:11}}
                      tickFormatter={(v)=> `${v}ms`}
                      width={52}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value)=>[`${value}ms`, "Response time"]}
                          labelFormatter={(label)=> `At ${label}`}
                        />
                      }
                    />
                    <Line
                          type="monotone"
                          dataKey="responseTime"
                          stroke="var(--color-responseTime)"
                          strokeWidth={2}
                          dot={false}
                          connectNulls={false}
                    />
                  </LineChart>
              </ChartContainer>
          </div>
        )}

        <div className="rounded-2xl border bg-card px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Checks</h2>
            <span className="text-xs text-muted-foreground">{checks.length} results</span>
          </div>

          {checks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No checks yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {checks.map((check) => (
                <div key={check.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`size-2 rounded-full ${check.status === "up" ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`text-sm font-medium ${check.status === "up" ? "text-green-500" : "text-red-500"}`}>
                      {check.status === "up" ? "Up" : "Down"}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{check.responseTime}ms</span>
                    <span>{new Date(check.checkedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
        </div>
  )
}