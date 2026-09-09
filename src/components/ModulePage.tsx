import { useMemo, useState, type ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Brain,
  CheckCircle2,
  Circle,
  Cpu,
  Gauge as GaugeIcon,
  Heart,
  Orbit,
  Radio,
  Rocket,
  Send,
  ShieldCheck,
  Sun,
  Thermometer,
  Timer,
  Wind,
  Zap,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import astronaut from "@/assets/astronaut-realistic.jpg";
import { alerts, timeline, trend } from "@/lib/mission-data";
import { AlertRow, Gauge, PageHeader, Panel, StatCard } from "@/components/dashboard-ui";
import { MissionGlobe } from "@/components/MissionGlobe";
import { SpacecraftTwin } from "@/components/SpacecraftTwin";
import { Rocket3D } from "@/components/Rocket3D";
import { Spacesuit3D } from "@/components/Spacesuit3D";
import { Button } from "@/components/ui/button";

type ModuleKind =
  | "rocket"
  | "astronaut"
  | "neuroscience"
  | "mission"
  | "orbit"
  | "environment"
  | "copilot"
  | "twin"
  | "alerts";

const moduleCopy: Record<ModuleKind, { title: string; subtitle: string; badge: string }> = {
  rocket: { title: "Rocket Health", subtitle: "Propulsion, thermal and structural telemetry", badge: "92 · Healthy" },
  astronaut: { title: "Astronaut Health", subtitle: "Live crew bio-telemetry and readiness", badge: "Crew Stable" },
  neuroscience: { title: "Neuroscience", subtitle: "Cognitive workload, sleep and adaptation", badge: "Normal" },
  mission: { title: "Mission Status", subtitle: "Astra-1 objectives, milestones and operations", badge: "On Track" },
  orbit: { title: "Orbital Tracking", subtitle: "Live position, trajectory and ground coverage", badge: "Stable Orbit" },
  environment: { title: "Space Environment", subtitle: "Solar weather, radiation and debris conditions", badge: "Conditions Good" },
  copilot: { title: "AI Mission Copilot", subtitle: "Operational support for the Astra-1 mission", badge: "Online" },
  twin: { title: "Digital Twin", subtitle: "Synchronized spacecraft systems model", badge: "99.8% Sync" },
  alerts: { title: "Alerts Control", subtitle: "Review, filter and acknowledge mission events", badge: "2 Active" },
};

const telemetry = Array.from({ length: 18 }, (_, index) => ({
  time: `${String(index).padStart(2, "0")}:00`,
  primary: 64 + Math.round(Math.sin(index / 2) * 12) + index,
  secondary: 48 + Math.round(Math.cos(index / 2.8) * 9),
  tertiary: 26 + Math.round(Math.sin(index / 1.4 + 1) * 6),
}));

function Metric({ icon: Icon, label, value, note }: { icon: ElementType; label: string; value: string; note: string }) {
  const IconComp = Icon as React.ComponentType<{ className?: string }>;
  return (
    <article className="rounded-lg border border-border bg-panel p-4">
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><IconComp className="size-4" /></span>
        <span className="text-[10px] text-success">LIVE</span>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>
    </article>
  );
}

function TelemetryChart({ title = "Live Telemetry" }: { title?: string }) {
  return (
    <Panel title={title} icon={Activity} className="min-h-[310px]">
      <div className="mb-4 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-chart-1" /> Primary</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-chart-2" /> Secondary</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-chart-3" /> Baseline</span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={telemetry} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} interval={3} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
            <Line dataKey="primary" stroke="var(--chart-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="secondary" stroke="var(--chart-2)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="tertiary" stroke="var(--chart-3)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function RocketModule() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric icon={Thermometer} label="Engine temperature" value="782 °C" note="4% below limit" />
        <Metric icon={GaugeIcon} label="Chamber pressure" value="18.4 MPa" note="Nominal range" />
        <Metric icon={Wind} label="Vibration" value="0.18 g" note="Stable across stages" />
        <Metric icon={BatteryCharging} label="Power reserve" value="87%" note="6h 42m projected" />
      </div>

      <Panel title="Astra-1 Heavy Launch Vehicle · 3D Live Telemetry & Diagnostics" icon={Rocket}>
        <Rocket3D />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <TelemetryChart title="Propulsion Telemetry" />
        <Panel title="System Health" icon={ShieldCheck}>
          <div className="flex justify-center">
            <Gauge value={92} />
          </div>
          <div className="mt-4 space-y-3">
            {["Propulsion", "Avionics", "Thermal control", "Communications"].map((item, i) => (
              <div key={item}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span>{item}</span>
                  <span className="text-success">{96 - i * 3}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${96 - i * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function AstronautModule({ brain = false }: { brain?: boolean }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        <Panel title={brain ? "Neural Readiness" : "Astra-1 Crew"} icon={brain ? Brain : Heart}>
          <div className="flex items-center gap-4">
            <img
              src={astronaut}
              alt="Astra-1 astronaut in realistic NASA spacesuit with helmet visor"
              className="size-24 rounded-lg object-cover object-top"
            />
            <div>
              <p className="font-display text-lg font-semibold">Commander Aria Sen</p>
              <p className="text-xs text-muted-foreground">Mission day 28</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-1 text-[10px] text-success">
                <span className="size-1.5 rounded-full bg-success" /> Ready for duty
              </span>
            </div>
          </div>
        </Panel>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric
            icon={brain ? Brain : Heart}
            label={brain ? "Cognitive score" : "Heart rate"}
            value={brain ? "94/100" : "72 bpm"}
            note="Within baseline"
          />
          <Metric
            icon={Timer}
            label={brain ? "Reaction time" : "Sleep"}
            value={brain ? "218 ms" : "7h 24m"}
            note="Improving"
          />
          <Metric
            icon={Activity}
            label={brain ? "Workload" : "Oxygen"}
            value={brain ? "Moderate" : "98%"}
            note="Nominal"
          />
          <Metric
            icon={Thermometer}
            label={brain ? "Stress index" : "Temperature"}
            value={brain ? "0.24" : "36.6 °C"}
            note="Stable"
          />
        </div>
      </div>

      {/* 3D Extravehicular Mobility Unit (EMU) Spacesuit Diagnostics */}
      {!brain && (
        <Panel
          title="Astra-1 Extravehicular Mobility Unit (EMU) · 3D Suit Diagnostics"
          icon={ShieldCheck}
        >
          <Spacesuit3D />
        </Panel>
      )}

      <TelemetryChart
        title={brain ? "Cognitive Performance · 24 Hours" : "Crew Vital Trends · 24 Hours"}
      />
    </>
  );
}

function MissionModule() {
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"><Panel title="Mission Objectives" icon={CheckCircle2}><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{["Primary orbit", "Payload deploy", "Science run", "Recovery"].map((item, i) => <div key={item} className="rounded-lg border border-border bg-panel-elevated p-3"><p className="text-[10px] text-muted-foreground">OBJECTIVE 0{i + 1}</p><p className="mt-2 text-sm font-semibold">{item}</p><p className={`mt-2 text-[11px] ${i < 2 ? "text-success" : i === 2 ? "text-primary" : "text-muted-foreground"}`}>{i < 2 ? "Completed" : i === 2 ? "In progress" : "Upcoming"}</p></div>)}</div><div className="mt-6 h-2 rounded-full bg-secondary"><div className="h-full w-[68%] rounded-full bg-primary" /></div><div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>Mission elapsed: 28d 14h</span><span>68% complete</span></div></Panel><Panel title="Mission Timeline" icon={Orbit}><ol className="space-y-4">{timeline.map((item, i) => <li key={item.label} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"><span className={`size-3 rounded-full ${i < 5 ? "bg-success" : i === 5 ? "bg-primary" : "bg-secondary"}`} /><div className="min-w-0"><p className="truncate text-xs font-medium">{item.label}</p><p className="text-[10px] text-muted-foreground">{item.date || "Scheduled"}</p></div><span className="text-[10px] text-muted-foreground">{item.status}</span></li>)}</ol></Panel></div>;
}

function OrbitModule() {
  return <><div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]"><Panel title="Live Orbital View" icon={Orbit}><MissionGlobe showOrbit /></Panel><div className="grid grid-cols-2 gap-3"><Metric icon={Orbit} label="Altitude" value="408 km" note="± 0.6 km" /><Metric icon={Zap} label="Velocity" value="7.66 km/s" note="Orbital speed" /><Metric icon={Radio} label="Ground link" value="98.7%" note="Bengaluru station" /><Metric icon={Timer} label="Next pass" value="18:42" note="In 34 minutes" /></div></div><TelemetryChart title="Altitude & Velocity History" /></>;
}

function EnvironmentModule() {
  return <><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric icon={Sun} label="Solar activity" value="Kp 2" note="Low activity" /><Metric icon={ShieldCheck} label="Radiation dose" value="0.31 mSv" note="Daily exposure" /><Metric icon={Wind} label="Solar wind" value="384 km/s" note="Nominal" /><Metric icon={AlertTriangle} label="Debris risk" value="Low" note="No conjunctions" /></div><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"><TelemetryChart title="Space Weather · 24 Hours" /><Panel title="Forecast" icon={Sun}><div className="space-y-3">{["Now", "+6 hours", "+12 hours", "+24 hours"].map((time, i) => <div key={time} className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-panel-elevated p-3 text-xs"><span className="text-muted-foreground">{time}</span><span>{i === 3 ? "Minor solar rise" : "Quiet conditions"}</span><span className={i === 3 ? "text-warning" : "text-success"}>{i === 3 ? "Watch" : "Good"}</span></div>)}</div></Panel></div></>;
}

function TwinModule() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
      <Panel title="Astra-1 Spacecraft Systems Model" icon={Cpu}>
        <SpacecraftTwin />
      </Panel>
      <Panel title="Twin Status" icon={Activity}>
        <div className="flex justify-center">
          <Gauge value={99} label="Sync Fidelity" status="Synchronized" />
        </div>
        <div className="mt-5 space-y-3">
          {[
            "Propulsion model",
            "Thermal model",
            "Power model",
            "Attitude control",
            "Life support",
          ].map((s, i) => (
            <div
              key={s}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-xs"
            >
              <span>{s}</span>
              <span className="text-success">{(99.9 - i * 0.2).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function CopilotModule() {
  const [messages, setMessages] = useState([{ from: "ai", text: "All Astra-1 systems are available. Ask me about mission status, crew health, orbit, or active alerts." }]);
  const [draft, setDraft] = useState("");
  const send = () => { if (!draft.trim()) return; const question = draft.trim(); setMessages((m) => [...m, { from: "user", text: question }, { from: "ai", text: `Astra-1 remains stable. Based on current telemetry, ${question.toLowerCase().includes("risk") ? "overall mission risk is low with one thermal trend under observation." : "all monitored values remain within operational limits."}` }]); setDraft(""); };
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"><Panel title="Mission Conversation" icon={Brain}><div className="flex h-[430px] flex-col"><div className="flex-1 space-y-3 overflow-y-auto pr-1">{messages.map((message, i) => <div key={`${message.from}-${i}`} className={`max-w-[85%] rounded-lg border p-3 text-xs leading-relaxed ${message.from === "user" ? "ml-auto border-primary/40 bg-primary/10" : "border-border bg-panel-elevated"}`}>{message.text}</div>)}</div><form className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}><input value={draft} onChange={(e) => setDraft(e.target.value)} className="h-10 min-w-0 rounded-md border border-border bg-secondary px-3 text-xs outline-none focus:border-primary" placeholder="Ask about the mission…" /><Button type="submit" size="icon" aria-label="Send question"><Send /></Button></form></div></Panel><Panel title="Suggested Analysis" icon={Zap}><div className="space-y-2">{["Summarize active risks", "Compare crew baselines", "Explain thermal trend", "Prepare shift handover"].map((q) => <Button key={q} variant="outline" className="h-auto w-full justify-start whitespace-normal py-3 text-left text-xs" onClick={() => setDraft(q)}>{q}</Button>)}</div></Panel></div>;
}

function AlertsModule() {
  const [filter, setFilter] = useState("All");
  const visible = useMemo(() => filter === "All" ? alerts : alerts.filter((a) => a.tag === filter), [filter]);
  return <><div className="flex flex-wrap gap-2">{["All", "Warning", "Observation", "Normal", "Resolved"].map((item) => <Button key={item} size="sm" variant={filter === item ? "default" : "outline"} onClick={() => setFilter(item)}>{item}</Button>)}</div><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"><Panel title={`${filter} Alerts`} icon={AlertTriangle}>{visible.length ? visible.map((a) => <AlertRow key={`${a.title}-${a.time}`} a={a} />) : <p className="py-12 text-center text-xs text-muted-foreground">No alerts in this category.</p>}</Panel><Panel title="Alert Summary" icon={ShieldCheck}><div className="grid grid-cols-2 gap-3">{[["2", "Active"], ["1", "Warning"], ["3", "Observed"], ["18", "Resolved"]].map(([value, label]) => <div key={label} className="rounded-lg border border-border bg-panel-elevated p-3 text-center"><p className="font-display text-2xl font-bold">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>)}</div></Panel></div></>;
}

export function ModulePage({ kind }: { kind: ModuleKind }) {
  const copy = moduleCopy[kind];
  return <div className="mx-auto w-full max-w-[1600px]"><PageHeader title={copy.title} subtitle={copy.subtitle} badge={copy.badge} /><div className="flex flex-col gap-4">{kind === "rocket" && <RocketModule />}{kind === "astronaut" && <AstronautModule />}{kind === "neuroscience" && <AstronautModule brain />}{kind === "mission" && <MissionModule />}{kind === "orbit" && <OrbitModule />}{kind === "environment" && <EnvironmentModule />}{kind === "copilot" && <CopilotModule />}{kind === "twin" && <TwinModule />}{kind === "alerts" && <AlertsModule />}</div></div>;
}