import {
  AlertTriangle,
  Bell,
  Box,
  Brain,
  Compass,
  FileText,
  Home,
  Rocket,
  Sun,
  UserCircle2,
} from "lucide-react";

export const navItems = [
  { icon: Home, label: "Home", to: "/" as const },
  { icon: Rocket, label: "Rocket Health", to: "/rocket-health" as const },
  { icon: UserCircle2, label: "Astronaut Health", to: "/astronaut-health" as const },
  { icon: Brain, label: "Neuroscience", to: "/neuroscience" as const },
  { icon: FileText, label: "Mission Status", to: "/mission-status" as const },
  { icon: Compass, label: "Orbital Tracking", to: "/orbital-tracking" as const },
  { icon: Sun, label: "Space Environment", to: "/space-environment" as const },
  { icon: Brain, label: "AI Copilot", to: "/ai-copilot" as const },
  { icon: Box, label: "Digital Twin", to: "/digital-twin" as const },
  { icon: Bell, label: "Alerts", to: "/alerts" as const },
];

export const alerts = [
  {
    icon: Rocket,
    tone: "text-destructive",
    title: "Rocket Health",
    sub: "Engine temperature rising",
    tag: "Warning",
    tagClass: "bg-destructive/85 text-primary-foreground",
    time: "12 min ago",
  },
  {
    icon: UserCircle2,
    tone: "text-warning",
    title: "Astronaut Health",
    sub: "Sleep quality below baseline",
    tag: "Observation",
    tagClass: "bg-warning/85 text-primary-foreground",
    time: "28 min ago",
  },
  {
    icon: Sun,
    tone: "text-warning",
    title: "Space Environment",
    sub: "Solar activity increased (minor)",
    tag: "Observation",
    tagClass: "bg-warning/85 text-primary-foreground",
    time: "1 hr ago",
  },
  {
    icon: FileText,
    tone: "text-info",
    title: "Mission Status",
    sub: "Next milestone approaching",
    tag: "Normal",
    tagClass: "bg-info/85 text-primary-foreground",
    time: "2 hr ago",
  },
  {
    icon: AlertTriangle,
    tone: "text-info",
    title: "Telemetry Link",
    sub: "Ground station handover completed",
    tag: "Normal",
    tagClass: "bg-info/85 text-primary-foreground",
    time: "3 hr ago",
  },
  {
    icon: Compass,
    tone: "text-success",
    title: "Orbital Tracking",
    sub: "Orbit correction burn nominal",
    tag: "Resolved",
    tagClass: "bg-success/85 text-primary-foreground",
    time: "5 hr ago",
  },
];

export const timeline = [
  { label: "Planned", date: "12 Jul 2025", status: "Completed" },
  { label: "Launch", date: "12 Aug 2025", status: "Completed" },
  { label: "Atmospheric Flight", date: "12 Aug 2025", status: "Completed" },
  { label: "Stage Separation", date: "12 Aug 2025", status: "Completed" },
  { label: "Orbit Injection", date: "12 Aug 2025", status: "Completed" },
  { label: "Orbital Operations", date: "", status: "In Progress" },
  { label: "Mission Completion", date: "", status: "Upcoming" },
];

export const sources = [
  { name: "NASA Open Science (OSDR)", sub: "Astronaut research & health" },
  { name: "NASA PCoE", sub: "Vehicle health & anomaly detection" },
  { name: "ISRO ISSDC", sub: "Indian mission & science data" },
  { name: "Bhoonidhi / MOSDAC", sub: "Environmental & space weather" },
  { name: "Orbital Data (TLE)", sub: "Satellite & orbital tracking" },
];

export const trend = Array.from({ length: 13 }, (_, i) => ({
  t: `${String(i * 2).padStart(2, "0")}:00`,
  temperature: 78 + Math.round(Math.sin(i / 1.5) * 7),
  pressure: 58 + Math.round(Math.cos(i / 1.8) * 6),
  vibration: 30 + Math.round(Math.sin(i / 1.2 + 1) * 6),
}));

export const sparkA = [22, 30, 26, 38, 34, 48, 44, 58, 54, 66, 62, 74];
export const sparkB = [18, 26, 24, 34, 30, 42, 50, 46, 58, 56, 68, 72];
