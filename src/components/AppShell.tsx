import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bell,
  Brain,
  Database,
  Rocket,
  Satellite,
  Search,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { navItems } from "@/lib/mission-data";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] bg-sidebar-primary text-sidebar-primary-foreground",
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
            <span className="truncate font-display text-lg font-bold tracking-[0.18em] sm:text-xl">ASTRA-X</span>
          </Link>
        </div>
        <p className="hidden min-w-0 truncate text-xs text-muted-foreground xl:block">
          <span className="text-foreground/80">AI-Powered Space Mission Health,</span> Tracking
          &amp; Management System
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-9 w-[380px] rounded-lg border border-border bg-secondary/60 pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
              placeholder="Search mission, astronaut, or ask AI..."
            />
          </div>
          <Link to="/alerts" className="relative p-1" aria-label="Open alerts">
            <Bell className="size-5 text-muted-foreground" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive" />
          </Link>
          <span className="grid size-8 place-items-center rounded-full border border-border bg-secondary">
            <User className="size-4 text-muted-foreground" />
          </span>
        </div>
      </header>

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
              <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
                <X />
              </Button>
            </div>
            <nav className="flex flex-col gap-1">{navigation(true)}</nav>
          </aside>
        </div>
      )}

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[210px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-sidebar p-3 lg:flex">
          {navigation()}
          <Link
            to="/ai-copilot"
            className="mt-6 block rounded-xl border border-primary/40 bg-primary/10 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-primary/20 font-display text-xs font-bold text-accent">
                AI
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold">AI Copilot</p>
                <p className="text-[10px] leading-tight text-muted-foreground">
                  Ask anything about your mission...
                </p>
              </div>
              <ArrowRight className="size-3.5 text-primary" />
            </div>
          </Link>
          <p className="mt-auto pt-4 text-[10px] text-muted-foreground">ASTRA-X&nbsp;&nbsp;v1.0</p>
        </aside>

        <main className="min-w-0 flex-1 p-3 sm:p-4">
          {children}

          <footer className="mt-5 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Brain className="size-3.5" /> Powered by AI
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="size-3.5" /> Real-time Data
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="size-3.5" /> Public Datasets
            </span>
            <span className="flex items-center gap-1.5">
              <Satellite className="size-3.5" /> Simulated Telemetry
            </span>
            <span className="ml-auto hidden md:block">ASTRA-X&nbsp;&nbsp;v1.0</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
