import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Globe } from "@/components/ui/globe"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { Activity, Bell, LineChart, Zap, Lock, CheckCircle2, XCircle } from "lucide-react"
import { DotPattern } from "@/components/ui/dot-pattern"
import { AnimatedList } from "@/components/ui/animated-list"

// ─────────────────────────────────────────────────────────────────────────────
// Bento backgrounds — each fills the flex-1 container naturally
// A gradient-to-transparent fade at the bottom (built into BentoCard) blends
// into the icon/text section below.
// ─────────────────────────────────────────────────────────────────────────────

const MONITORS = [
  { label: "api.myapp.com",       ms: "142ms", uptime: "99.9%", status: "up"   },
  { label: "dashboard.myapp.com", ms: "89ms",  uptime: "100%",  status: "up"   },
  { label: "webhooks.myapp.com",  ms: "—",     uptime: "81.2%", status: "down" },
  { label: "cdn.myapp.com",       ms: "34ms",  uptime: "99.7%", status: "up"   },
]

function StatsBg() {
  return (
    <div className="px-5 pt-6 flex flex-col gap-2.5">
      {MONITORS.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3 backdrop-blur"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {row.status === "up"
              ? <CheckCircle2 className="size-4 text-green-500 shrink-0" />
              : <XCircle className="size-4 text-red-500 shrink-0" />
            }
            <span className="font-mono text-sm text-foreground/70 truncate">{row.label}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono shrink-0 ml-3">
            <span className="text-muted-foreground">{row.uptime}</span>
            <span className={`font-bold tabular-nums ${row.status === "down" ? "text-red-500" : "text-foreground/60"}`}>
              {row.ms}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const ALERTS = [
  { title: "api.myapp.com is DOWN",         sub: "Response timeout after 10s", time: "just now",   type: "down" },
  { title: "webhooks.myapp.com recovered",  sub: "Response time: 212ms",       time: "4 min ago",  type: "up"   },
  { title: "cdn.myapp.com is DOWN",         sub: "Status code: 503",           time: "18 min ago", type: "down" },
  { title: "dashboard.myapp.com recovered", sub: "Response time: 91ms",        time: "1 hr ago",   type: "up"   },
  { title: "api.myapp.com recovered",       sub: "Response time: 178ms",       time: "2 hr ago",   type: "up"   },
]

function AlertBg() {
  return (
    <div className="px-5 pt-6 overflow-hidden">
      <AnimatedList delay={1200} className="w-full gap-2.5">
        {ALERTS.map((n) => (
          <div
            key={n.title}
            className={`w-full rounded-xl border px-4 py-3 backdrop-blur ${
              n.type === "down"
                ? "border-red-500/30 bg-red-500/[0.06]"
                : "border-green-500/30 bg-green-500/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`size-2 rounded-full shrink-0 ${n.type === "down" ? "bg-red-500" : "bg-green-500"}`} />
                <p className="text-sm font-semibold truncate">{n.title}</p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0">{n.time}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1 pl-4">{n.sub}</p>
          </div>
        ))}
      </AnimatedList>
    </div>
  )
}

const CHART_BARS = [
  { h: 40 }, { h: 65 }, { h: 35 }, { h: 72 }, { h: 88 }, { h: 55 },
  { h: 18, down: true },
  { h: 50 }, { h: 78 }, { h: 42 }, { h: 92 }, { h: 68 }, { h: 95 },
]

function ChartBg() {
  return (
    <div className="px-5 pt-5 pb-2 flex flex-col h-full">
      {/* top label row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono text-muted-foreground">Response time (ms)</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-red-500">
          <span className="size-2 rounded-full bg-red-500/70" />
          outage detected
        </span>
      </div>
      {/* bars */}
      <div className="flex items-end gap-1 w-full" style={{ height: "9rem" }}>
        {CHART_BARS.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full">
            <div
              className={`w-full rounded-t-sm transition-all duration-300 ${
                bar.down
                  ? "bg-red-400/80"
                  : "bg-foreground/[0.15] group-hover:bg-foreground/25"
              }`}
              style={{ height: `${bar.h}%` }}
            />
          </div>
        ))}
      </div>
      {/* x axis */}
      <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono mt-1.5 border-t border-border/50 pt-1.5">
        <span>12h ago</span>
        <span>9h ago</span>
        <span>6h ago</span>
        <span>3h ago</span>
        <span>now</span>
      </div>
    </div>
  )
}

function CheckBg() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 pt-8 pb-2">
      {/* pulse rings */}
      <div className="relative flex items-center justify-center">
        <div className="absolute size-32 rounded-full border border-green-500/10 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute size-24 rounded-full border border-green-500/15" />
        <div className="absolute size-16 rounded-full border-2 border-green-500/25" />
        <div className="size-12 rounded-full bg-green-500/10 border-2 border-green-500/50 flex items-center justify-center">
          <CheckCircle2 className="size-6 text-green-500" />
        </div>
        {/* zap badge */}
        <div className="absolute -top-1 -right-1 size-6 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-sm">
          <Zap className="size-3 text-yellow-500" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold">Check triggered</p>
        <p className="text-xs text-muted-foreground mt-1 font-mono">api.myapp.com · 178ms · HTTP 200</p>
      </div>
      {/* status pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/[0.06] px-4 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
        <span className="size-1.5 rounded-full bg-green-500" />
        Healthy
      </div>
    </div>
  )
}

const SECURITY_ITEMS = [
  { label: "JWT authentication",  detail: "Signed, expiring tokens"      },
  { label: "bcrypt passwords",    detail: "12 rounds, salted"            },
  { label: "httpOnly cookies",    detail: "XSS-safe session storage"     },
  { label: "Email verification",  detail: "Required on sign-up"          },
]

function SecureBg() {
  return (
    <div className="px-6 pt-6 flex flex-col gap-2.5">
      {SECURITY_ITEMS.map((item, i) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3 backdrop-blur"
        >
          <div className="size-7 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-4 text-green-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const BENTO_ITEMS = [
  {
    name: "Live monitor dashboard",
    description: "All monitors, status, uptime and response times at a glance.",
    Icon: Activity,
    href: "/signup",
    cta: "Get started",
    className: "lg:col-span-1",
    background: <StatsBg />,
  },
  {
    name: "Instant alerts",
    description: "Get emailed the second something goes down — and when it recovers.",
    Icon: Bell,
    href: "/signup",
    cta: "Get started",
    className: "lg:col-span-2",
    background: <AlertBg />,
  },
  {
    name: "Response time charts",
    description: "Track latency over time. Spot degradation before it becomes an outage.",
    Icon: LineChart,
    href: "/signup",
    cta: "View demo",
    className: "lg:col-span-2",
    background: <ChartBg />,
  },
  {
    name: "Manual health checks",
    description: "Trigger an instant check any time, without waiting for the next interval.",
    Icon: Zap,
    href: "/signup",
    cta: "Try it",
    className: "lg:col-span-1",
    background: <CheckBg />,
  },
  {
    name: "Secure & private",
    description: "JWT auth, bcrypt passwords, httpOnly cookies. No shortcuts.",
    Icon: Lock,
    href: "/signup",
    cta: "Learn more",
    className: "lg:col-span-3",
    background: <SecureBg />,
  },
]

// ─────────────────────────────────────────────────────────────────────────────

export function Landing() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <FlickeringGrid
            className="w-full h-full"
            squareSize={4}
            gridGap={6}
            flickerChance={0.15}
            color="currentColor"
            maxOpacity={0.08}
          />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 text-center w-full">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-3 py-1 text-xs text-muted-foreground mb-6">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            Open source uptime monitoring
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
            Know when your app goes down.{" "}
            <span className="text-muted-foreground">Before your users do.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            PulseOps monitors your URLs, tracks response times, and fires instant alerts when something breaks.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/signup">
              <Button size="lg" className="rounded-full px-8 h-12 text-base">
                Get started free
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base bg-background/80 backdrop-blur">
                Try demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bento features ── */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Everything you need</h2>
          <p className="text-muted-foreground">No bloat. Just the features that matter.</p>
        </div>
        <BentoGrid>
          {BENTO_ITEMS.map((item) => (
            <BentoCard key={item.name} {...item} />
          ))}
        </BentoGrid>
      </section>

      {/* ── Globe + stats ── */}
      <section className="relative overflow-hidden max-w-full py-32">
        <DotPattern
          width={20}
          height={20}
          cr={1}
          className="opacity-40 text-foreground"
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />

        <div className="relative z-20 max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
                Always on.{" "}
                <span className="text-muted-foreground">Everywhere.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                PulseOps watches your endpoints 24/7 and tells you the moment something breaks.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "99.9%", label: "Uptime tracked" },
                  { value: "< 10s", label: "Alert delivery" },
                  { value: "5 min", label: "Min interval"   },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border bg-card/80 backdrop-blur px-4 py-6 text-center">
                    <p className="text-2xl font-bold mb-1.5">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center h-[500px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-3xl" />
              <Globe />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-2xl border bg-card px-8 py-12 text-center">
          <div className="absolute inset-0 z-0 opacity-50">
            <FlickeringGrid
              squareSize={3}
              gridGap={5}
              flickerChance={0.1}
              color="currentColor"
              maxOpacity={0.05}
            />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Start monitoring in 30 seconds</h2>
            <p className="text-muted-foreground mb-6">No credit card. No setup. Just add a URL.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/signup">
                <Button size="lg" className="rounded-full px-6">Create free account</Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="rounded-full px-6">Try demo first</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t">
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold">PulseOps</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/login"  className="hover:text-foreground transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
            <Link to="/demo"   className="hover:text-foreground transition-colors">Demo</Link>
          </div>
          <p className="text-xs text-muted-foreground">Built by Rusil</p>
        </div>
      </footer>

    </div>
  )
}
