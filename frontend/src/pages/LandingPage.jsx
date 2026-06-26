import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Globe } from "@/components/ui/globe"

const FEATURES = [
  {
    icon: "🟢",
    title: "Real-time monitoring",
    desc: "We ping your URLs every 5 minutes and alert you the moment something goes down.",
  },
  {
    icon: "📬",
    title: "Instant email alerts",
    desc: "Get notified the second your monitor goes down — and again when it recovers.",
  },
  {
    icon: "📈",
    title: "Response time charts",
    desc: "Visualize latency trends over time to catch degradation before it becomes an outage.",
  },
  {
    icon: "⚡",
    title: "Manual checks",
    desc: "Trigger an instant health check any time without waiting for the next interval.",
  },
  {
    icon: "🔒",
    title: "Secure by default",
    desc: "JWT auth, bcrypt passwords, httpOnly cookies. No shortcuts on security.",
  },
  {
    icon: "🎛️",
    title: "Per-monitor controls",
    desc: "Set custom intervals, toggle alerts, and manage each monitor independently.",
  },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero — globe on right, text on left */}
      <section className="max-w-5xl mx-auto px-4 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground mb-6">
              <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              Open source uptime monitoring
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
              Know when your app<br />
              goes down.{" "}
              <span className="text-muted-foreground">Before your users do.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              PulseOps monitors your URLs across the globe, tracks response times, and fires instant alerts when something breaks.
            </p>
            <div className="flex items-center gap-3">
              <Link to="/signup">
                <Button size="lg" className="rounded-full px-6">Get started free</Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="rounded-full px-6">Try demo</Button>
              </Link>
            </div>
          </div>

          {/* Right — globe */}
          <div className="relative flex items-center justify-center h-[400px]">
            {/* glow ring behind the globe */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-3xl" />
            <Globe className="relative" />
          </div>

        </div>
      </section>

      {/* Stats strip */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "99.9%", label: "Uptime tracked" },
            { value: "< 10s", label: "Alert delivery" },
            { value: "5 min", label: "Min check interval" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card px-5 py-5 text-center">
              <p className="text-2xl font-bold mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-center mb-2">Everything you need</h2>
        <p className="text-center text-muted-foreground mb-10">No bloat. Just the features that matter.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card px-5 py-5 hover:border-foreground/20 transition-colors">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="rounded-2xl border bg-card px-8 py-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Start monitoring in 30 seconds</h2>
          <p className="text-muted-foreground mb-6">No credit card. No setup. Just add a URL.</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="rounded-full px-6">Create free account</Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="rounded-full px-6">Try demo first</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold">PulseOps</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
            <Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link>
          </div>
          <p className="text-xs text-muted-foreground">Built by Rusil</p>
        </div>
      </footer>

    </div>
  )
}
