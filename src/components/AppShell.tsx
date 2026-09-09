import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bell,
  Brain,
  Database,
  Moon,
  Rocket,
  Satellite,
  Search,
  Sun,
  User,
  Menu,
  X,
  Radio,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

import { navItems } from "@/lib/mission-data";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [utcTime, setUtcTime] = useState("");

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const saved = (localStorage.getItem("astra_theme") as "dark" | "light") || "dark";
    setTheme(saved);
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Live UTC Clock
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const setMode = (next: "dark" | "light") => {
    setTheme(next);
    localStorage.setItem("astra_theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setMode(next);
  };

  const navigation = (mobile = false) => (
    <>
      {navItems.map((n) => (
        <Link
          key={n.label}
          to={n.to}
          activeOptions={{ exact: n.to === "/" }}
          onClick={() => mobile && setMobileOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          activeProps={{
            className:
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] bg-sidebar-primary text-sidebar-primary-foreground font-medium",
          }}
        >
          <n.icon className="size-4 shrink-0" />
          {n.label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-sidebar/95 px-3 backdrop-blur sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <Link to="/" className="flex min-w-0 items-center gap-2 lg:w-[190px]">
            <Rocket className="size-6 -rotate-45 text-primary" />
            <span className="truncate font-display text-lg font-bold tracking-[0.18em] sm:text-xl">
              ASTRA-X
            </span>
          </Link>
        </div>

        {/* Flight Operations Center Telemetry Status Header */}
        <div className="hidden min-w-0 items-center gap-4 text-xs xl:flex">
          <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-2.5 py-1">
            <span className="size-2 rounded-full bg-success animate-pulse" />
            <span className="font-mono text-[11px] text-muted-foreground font-medium">
              DSN: LOCKED
            </span>
          </div>

          <div className="font-mono text-[11px] text-muted-foreground">
            MET <span className="text-foreground font-semibold">+28:14:08:24</span>
          </div>

          <div className="font-mono text-[11px] text-muted-foreground">{utcTime}</div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-9 w-[320px] lg:w-[380px] rounded-lg border border-border bg-secondary/60 pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
              placeholder="Search telemetry, crew, subsystems..."
            />
          </div>

          {/* Quick Theme Toggle Button in Header */}
          <button
            onClick={toggleTheme}
            className="grid size-9 place-items-center rounded-lg border border-border bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            aria-label="Toggle light and dark theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4 text-warning" />
            ) : (
              <Moon className="size-4 text-primary" />
            )}
          </button>

          <Link to="/alerts" className="relative p-1" aria-label="Open alerts">
            <Bell className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive" />
          </Link>

          <span className="grid size-8 place-items-center rounded-full border border-border bg-secondary">
            <User className="size-4 text-muted-foreground" />
          </span>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-background/75 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,310px)] flex-col border-r border-border bg-sidebar p-3 shadow-2xl">
            <div className="mb-4 flex items-center justify-between px-2">
              <span className="font-display text-lg font-bold tracking-[0.18em]">ASTRA-X</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X />
              </Button>
            </div>
            <nav className="flex flex-col gap-1">{navigation(true)}</nav>

            <div className="mt-auto pt-4 border-t border-border">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Theme
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {theme === "dark" ? "NIGHT OPS" : "DAY OPS"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary/80 p-1">
                <button
                  type="button"
                  onClick={() => setMode("light")}
                  className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs transition-all ${
                    theme === "light"
                      ? "bg-card font-semibold text-foreground shadow-sm"
                      : "font-medium text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className={`size-3.5 ${theme === "light" ? "text-amber-500" : ""}`} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("dark")}
                  className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs transition-all ${
                    theme === "dark"
                      ? "bg-card font-semibold text-foreground shadow-sm"
                      : "font-medium text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className={`size-3.5 ${theme === "dark" ? "text-primary" : ""}`} />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar & Main Viewport */}
      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[220px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-sidebar p-3 lg:flex">
          {navigation()}

          {/* Operational AI Assistant Card */}
          <Link
            to="/ai-copilot"
            className="mt-5 block rounded-xl border border-primary/40 bg-primary/10 p-3 transition-colors hover:bg-primary/15"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/20 font-display text-xs font-bold text-accent">
                COPILOT
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">Mission Copilot</p>
                <p className="text-[10px] leading-tight text-muted-foreground truncate">
                  Astra-1 Telemetry AI
                </p>
              </div>
              <ArrowRight className="size-3.5 text-primary" />
            </div>
          </Link>

          {/* White and Dark Theme Toggle at Slider (Sidebar) */}
          <div className="mt-auto pt-3 border-t border-border/70">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Theme
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {theme === "dark" ? "NIGHT OPS" : "DAY OPS"}
              </span>
            </div>

            {/* Segmented slider toggle */}
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary/80 p-1">
              <button
                type="button"
                onClick={() => setMode("light")}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs transition-all ${
                  theme === "light"
                    ? "bg-card font-semibold text-foreground shadow-sm"
                    : "font-medium text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Switch to Light Theme"
              >
                <Sun className={`size-3.5 ${theme === "light" ? "text-amber-500" : ""}`} />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("dark")}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs transition-all ${
                  theme === "dark"
                    ? "bg-card font-semibold text-foreground shadow-sm"
                    : "font-medium text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Switch to Dark Theme"
              >
                <Moon className={`size-3.5 ${theme === "dark" ? "text-primary" : ""}`} />
                <span>Dark</span>
              </button>
            </div>

            <p className="mt-2.5 text-center font-mono text-[10px] text-muted-foreground">
              ASTRA-X FLIGHT OPS · v1.0.4
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-3 sm:p-4">
          {children}

          <footer className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Radio className="size-3.5 text-success" /> Telemetry Synced
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="size-3.5" /> Real-time Telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="size-3.5" /> NASA OSDR Datasets
            </span>
            <span className="flex items-center gap-1.5">
              <Satellite className="size-3.5" /> Astra-1 Orbital Flight
            </span>
            <span className="ml-auto hidden md:block font-mono">ASTRA-X MISSION CONTROL</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
