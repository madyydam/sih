import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  CheckCircle2,
  Circle,
  Compass,
  Database,
  FileText,
  Heart,
  Moon,
  Rocket,
  Satellite,
  Send,
  Sun,
  Thermometer,
  UserCircle2,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Suspense } from "react";

import heroRocket from "@/assets/hero-rocket.jpg";
import astronautRealistic from "@/assets/astronaut-realistic.jpg";

import { AppShell } from "@/components/AppShell";
import { MissionGlobe } from "@/components/MissionGlobe";
import { alerts, sources, sparkA, sparkB, timeline, trend } from "@/lib/mission-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASTRA-X | AI Space Mission Health & Tracking Dashboard" },
      {
        name: "description",
        content:
          "ASTRA-X mission control: real-time rocket health, astronaut vitals, orbital tracking and AI copilot insights for the Astra-1 mission.",
      },
      { property: "og:title", content: "ASTRA-X | Mission Control Dashboard" },
      {
        property: "og:description",
        content:
          "Track rocket health, astronaut vitals, space environment and orbital status in one AI-powered mission control view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - ((v - min) / (max - min || 1)) * 26 - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-9 w-full">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 30 - ((v - min) / (max - min || 1)) * 26 - 2;
        return <circle key={i} cx={x} cy={y} r="1.1" fill={color} />;
      })}
    </svg>
  );
}

function Panel({
  title,
  icon: Icon,
  action,
  actionTo,
  children,
  className = "",
}: {
  title: string;
  icon: React.ElementType;
  action?: string;
  actionTo?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const IconComp = Icon as React.ComponentType<{ className?: string }>;
  return (
    <section
      className={`rounded-xl border border-border bg-panel/80 shadow-[0_1px_0_0_oklch(1_0_0/6%)_inset] ${className}`}
    >
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <IconComp className="size-4 text-primary" />
          <h2 className="font-display text-sm font-semibold tracking-wide">{title}</h2>
        </div>
        {action && actionTo && (
          <Link
            to={actionTo as "/"}
            className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-accent"
          >
            {action} →
          </Link>
        )}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function AlertRow({ a }: { a: (typeof alerts)[number] }) {
  const Icon = a.icon;
  return (
    <div className="flex items-center gap-3 border-b border-border/50 py-2.5 last:border-0">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary">
        <Icon className={`size-3.5 ${a.tone}`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{a.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">{a.sub}</p>
      </div>
      <span className="hidden text-[10px] text-muted-foreground sm:block">{a.time}</span>
      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${a.tagClass}`}>
        {a.tag}
      </span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  suffix,
  status,
  statusClass,
  children,
  linkTo,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  suffix?: string;
  status?: string;
  statusClass?: string;
  children?: React.ReactNode;
  linkTo?: string;
}) {
  const IconComp = Icon as React.ComponentType<{ className?: string }>;
  const content = (
    <article className="rounded-xl border border-border bg-panel/80 p-4 transition-colors hover:border-primary/40">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconComp className="size-4 text-primary" />
          <h3 className="text-[13px] font-medium text-foreground/90">{title}</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">›</span>
      </div>
      <p className="font-display text-3xl font-bold leading-none">
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>
        )}
      </p>
      {status && (
        <p className={`mt-2 flex items-center gap-1.5 text-xs ${statusClass}`}>
          <span className="size-1.5 rounded-full bg-current" />
          {status}
        </p>
      )}
      {children}
    </article>
  );

  if (linkTo) {
    return <Link to={linkTo as "/"}>{content}</Link>;
  }
  return content;
}

function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Two-column grid: left content | right rail — right rail starts from the very top */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">

          {/* Hero banner */}
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img
              src={heroRocket}
              alt="Rocket ascending above Earth's atmosphere"
              width={1600}
              height={560}
              className="h-[200px] w-full object-cover sm:h-[250px]"
            />
            <div
              className="absolute inset-0"
              style={{ background: "var(--gradient-hero)" }}
            />
            <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6">
              <p className="font-display text-xl font-semibold text-primary sm:text-2xl">
                Good Morning,
              </p>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">Mission Control</h1>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                All systems are operational. Here's the current status of your space mission.
              </p>
              <div className="mt-4 w-fit rounded-xl border border-border bg-panel/85 px-3 py-2 backdrop-blur sm:px-4 sm:py-3">
                <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-success" /> Mission
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <p className="font-display text-xl font-bold">Astra-1</p>
                  <span className="flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 text-[11px] text-success">
                    <span className="size-1.5 rounded-full bg-success" /> In Orbit
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Launched · 12 Aug 2025 · Orbit Phase · Operational
                </p>
              </div>
            </div>
            <div className="absolute right-4 top-4 hidden text-right text-[11px] text-muted-foreground md:right-6 md:top-6 md:block">
              <p>"Data today,</p>
              <p>Safer missions tomorrow."</p>
              <div className="mt-2 ml-auto h-px w-24 bg-border" />
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
            <StatCard
              icon={Rocket}
              title="Rocket Health"
              value="92"
              suffix="/100"
              status="Healthy"
              statusClass="text-success"
              linkTo="/rocket-health"
            >
              <Sparkline data={sparkA} color="oklch(0.78 0.15 165)" />
            </StatCard>
            <StatCard
              icon={UserCircle2}
              title="Astronaut Health"
              value="88"
              suffix="/100"
              status="Healthy"
              statusClass="text-success"
              linkTo="/astronaut-health"
            >
              <Sparkline data={sparkB} color="oklch(0.7 0.15 245)" />
            </StatCard>
            <StatCard
              icon={FileText}
              title="Mission Status"
              value="On Track"
              linkTo="/mission-status"
            >
              <p className="mt-3 text-[11px] text-muted-foreground">Next Milestone</p>
              <p className="text-[11px] text-foreground/80">Orbital Operations</p>
              <div className="mt-2 h-1.5 rounded-full bg-secondary">
                <div className="h-full w-[62%] rounded-full bg-primary" />
              </div>
            </StatCard>
            <StatCard icon={Sun} title="Space Environment" value="Good" linkTo="/space-environment">
              <p className="mt-3 text-[11px] text-muted-foreground">Low Solar Activity</p>
              <div className="mt-3 h-1.5 rounded-full bg-secondary">
                <div className="h-full w-[35%] rounded-full bg-warning" />
              </div>
            </StatCard>
            <StatCard icon={Compass} title="Orbital Tracking" value="Stable" linkTo="/orbital-tracking">
              <p className="mt-3 text-[11px] text-muted-foreground">
                Altitude · <span className="text-foreground/80">408 km</span>
              </p>
              <Satellite className="ml-auto mt-1 size-6 text-primary/70" />
            </StatCard>
          </div>

          {/* Mission Overview + Rocket Health Trend */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel
              title="Mission Overview"
              icon={Satellite}
              action="View Details"
              actionTo="/orbital-tracking"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-full overflow-hidden rounded-lg sm:w-1/2">
                  <Suspense
                    fallback={
                      <div className="flex h-44 items-center justify-center rounded-lg bg-secondary/40 text-[11px] text-muted-foreground">
                        Loading globe…
                      </div>
                    }
                  >
                    <MissionGlobe compact />
                  </Suspense>
                </div>
                <div className="flex-1 space-y-2 text-[11px]">
                  <div>
                    <p className="text-muted-foreground">Current Position</p>
                    <p>Lat 12.34° N &nbsp; Lon 73.58° E</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Altitude</p>
                    <p className="text-sm font-semibold">408 km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Velocity</p>
                    <p className="text-sm font-semibold">7.66 km/s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trajectory</p>
                    <p className="font-semibold text-success">Stable</p>
                  </div>
                  <Link
                    to="/orbital-tracking"
                    className="mt-1 block w-full rounded-lg border border-primary/50 bg-primary/10 py-1.5 text-center text-[11px] text-primary transition-colors hover:bg-primary/20"
                  >
                    View Orbital Details
                  </Link>
                </div>
              </div>
            </Panel>

            <Panel
              title="Rocket Health Trend"
              icon={Activity}
              action="View Details"
              actionTo="/rocket-health"
            >
              <div className="flex gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-chart-1" /> Temperature
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-chart-2" /> Pressure
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-chart-3" /> Vibration
                    </span>
                  </div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                        <CartesianGrid stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="t"
                          tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                          interval={1}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          domain={[0, 120]}
                          tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Line dataKey="temperature" stroke="var(--chart-1)" strokeWidth={2} isAnimationActive={false} type="monotone" dot={{ r: 2 }} />
                        <Line dataKey="pressure" stroke="var(--chart-2)" strokeWidth={2} isAnimationActive={false} type="monotone" dot={{ r: 2 }} />
                        <Line dataKey="vibration" stroke="var(--chart-3)" strokeWidth={2} isAnimationActive={false} type="monotone" dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid w-32 shrink-0 place-items-center rounded-lg border border-border bg-panel-elevated p-3">
                  <p className="text-[11px] text-muted-foreground">Health Score</p>
                  <div className="relative my-2 grid size-20 place-items-center">
                    <svg viewBox="0 0 36 36" className="absolute size-20 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--secondary)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="97.4" strokeDashoffset="7.8" />
                    </svg>
                    <div className="text-center">
                      <p className="font-display text-xl font-bold">92</p>
                      <p className="text-[9px] text-muted-foreground">/100</p>
                    </div>
                  </div>
                  <p className="flex items-center gap-1.5 text-[11px] text-success">
                    <span className="size-1.5 rounded-full bg-success" /> Healthy
                  </p>
                </div>
              </div>
            </Panel>
          </div>

          {/* Bottom row: Astronaut Health + AI Mission Copilot */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel title="Astronaut Health" icon={UserCircle2} action="View Details" actionTo="/astronaut-health">
              <div className="flex items-center gap-3">
                <img
                  src={astronautRealistic}
                  alt="Astra-1 crew member in realistic NASA spacesuit with helmet visor"
                  width={512}
                  height={512}
                  loading="lazy"
                  className="size-16 rounded-lg object-cover object-top"
                />
                <div>
                  <p className="text-sm font-semibold">Astra-1 Crew</p>
                  <p className="text-[11px] text-muted-foreground">
                    2 Astronauts · 1 Mission Specialist
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] text-success">
                    <span className="size-1.5 rounded-full bg-success" /> Stable
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                {[
                  { icon: Heart, label: "Heart Rate", value: "72 bpm", tone: "text-destructive" },
                  { icon: Thermometer, label: "Body Temp", value: "36.6 °C", tone: "text-info" },
                  { icon: Moon, label: "Sleep Quality", value: "Good", tone: "text-violet" },
                  { icon: Brain, label: "Cognitive", value: "Normal", tone: "text-accent" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-2 rounded-lg border border-border bg-panel-elevated px-2.5 py-2">
                    <m.icon className={`size-4 ${m.tone}`} />
                    <div className="min-w-0">
                      <p className="truncate text-[10px] text-muted-foreground">{m.label}</p>
                      <p className="font-medium">{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="AI Mission Copilot" icon={Brain} action="Open" actionTo="/ai-copilot">
              <div className="relative">
                <input
                  className="h-10 w-full rounded-lg border border-border bg-secondary/60 px-3 pr-10 text-[11px] outline-none placeholder:text-muted-foreground focus:border-primary"
                  placeholder="Ask anything about your mission..."
                />
                <Send className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              </div>
              <div className="mt-3 space-y-2">
                {[
                  "What is the current risk level?",
                  "Why did the rocket health score drop?",
                  "Summarize the mission status.",
                  "Any alerts I should know about?",
                ].map((q) => (
                  <Link
                    key={q}
                    to="/ai-copilot"
                    className="flex w-full items-center gap-2 rounded-lg border border-border bg-panel-elevated px-3 py-2 text-left text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    <Circle className="size-3 text-primary" />
                    {q}
                  </Link>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* RIGHT RAIL — starts from very top, aligned with hero */}
        <div className="flex flex-col gap-4">
          <Panel title="Recent Alerts" icon={Bell} action="View All" actionTo="/alerts">
            {alerts.map((a) => (
              <AlertRow key={`${a.title}-${a.time}`} a={a} />
            ))}
          </Panel>

          <Panel title="Mission Timeline" icon={Compass} action="View All" actionTo="/mission-status">
            <ol className="relative space-y-3.5 pl-1">
              {timeline.map((t, i) => {
                const done = t.status === "Completed";
                const active = t.status === "In Progress";
                return (
                  <li key={t.label} className="relative flex items-start gap-3">
                    {i < timeline.length - 1 && (
                      <span className="absolute left-[9px] top-5 h-full w-px bg-border" />
                    )}
                    {done ? (
                      <CheckCircle2 className="size-[18px] shrink-0 text-success" />
                    ) : active ? (
                      <Circle className="size-[18px] shrink-0 fill-primary/30 text-primary" />
                    ) : (
                      <Circle className="size-[18px] shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium">{t.label}</p>
                      {t.date && (
                        <p className="text-[10px] text-muted-foreground">{t.date}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[10px] ${
                        done
                          ? "bg-success/15 text-success"
                          : active
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {t.status}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel title="Public Data Sources" icon={Database}>
            <div className="space-y-3">
              {sources.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-secondary">
                    <Database className="size-3.5 text-primary" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium">{s.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
