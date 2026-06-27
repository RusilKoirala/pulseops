import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import api from "@/lib/api"
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from "lucide-react"

export function StatusPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/status-pages/${id}`)
        setData(res.data.data)
      } catch (error) {
        console.error("Failed to fetch status page")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>)
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Status Page Not Found</h2>
          <p className="text-muted-foreground">This status page doesn't exist.</p>
        </div>
      </div>
    )
  }

  const { statusPage, checks, activeIncidents, uptime, currentStatus } = data
  const isUp = currentStatus === "up"

  const chartData = [...checks]
    .reverse()
    .map((check, i) => ({
      index: i + 1,
      time: new Date(check.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      responseTime: check.status === "up" ? Number(check.responseTime) : null
    }))

  const chartConfig = {
    responseTime: { label: "Response Time", color: statusPage.primaryColor || "#3b82f6" }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          {statusPage.logoUrl && (
            <img src={statusPage.logoUrl} alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-lg" />
          )}
          <h1 className="text-3xl font-bold mb-2">{statusPage.title}</h1>
          {statusPage.description && (
            <p className="text-muted-foreground">{statusPage.description}</p>
          )}
        </div>

        <div className="bg-card rounded-2xl border p-6 mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className={`w-4 h-4 rounded-full ${isUp ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
            <h2 className="text-2xl font-bold">
              {isUp ? "All Systems Operational" : "Service Disruption"}
            </h2>
          </div>
          <p className="text-muted-foreground">{statusPage.monitor.url}</p>
        </div>

        {activeIncidents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Active Incidents
            </h3>
            {activeIncidents.map((incident) => (
              <div key={incident.id} className="bg-card rounded-xl border p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{incident.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    incident.status === "investigating" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                    incident.status === "identified" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  }`}>
                    {incident.status}
                  </span>
                </div>
                {incident.description && (
                  <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                )}
                {incident.updates?.length > 0 && (
                  <div className="space-y-2">
                    {incident.updates.map((update) => (
                      <div key={update.id} className="text-sm border-l-2 pl-3 border-muted">
                        <p>{update.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(update.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl border p-4">
            <p className="text-sm text-muted-foreground mb-1">Uptime</p>
            <p className="text-2xl font-bold">{uptime}%</p>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <p className="text-sm text-muted-foreground mb-1">Last Checked</p>
            <p className="text-2xl font-bold">
              {checks[0] ? new Date(checks[0].checkedAt).toLocaleTimeString() : "—"}
            </p>
          </div>
        </div>

        {chartData.length > 1 && (
          <div className="bg-card rounded-2xl border p-6 mb-6">
            <h3 className="font-semibold mb-4">Response Time</h3>
            <div className="w-full h-64">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <LineChart 
                  accessibilityLayer 
                  data={chartData} 
                  className="w-full h-full"
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${v}ms`}
                    width={52}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${value}ms`, "Response time"]}
                        labelFormatter={(label) => `At ${label}`}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke={statusPage.primaryColor || "#3b82f6"}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          Powered by <u><Link to="/">PulseOps</Link></u>
        </div>
      </div>
    </div>
  )
}
