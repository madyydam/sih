import { ArrowRight, ChevronRight } from "lucide-react";
import type { ReactNode, ElementType } from "react";

import { alerts } from "@/lib/mission-data";

export function Panel({
  title,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  icon: ElementType;
  action?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-panel/80 shadow-[0_1px_0_0_oklch(1_0_0/6%)_inset] ${className}`}
    >
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <h2 className="font-display text-sm font-semibold tracking-wide">{title}</h2>
        </div>
        {action && (
          <button className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-accent">
            {action} <ArrowRight className="size-3" />
          </button>
        )}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function AlertRow({ a }: { a: (typeof alerts)[number] }) {
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

export function StatCard({
  icon: Icon,
  title,
  value,
  suffix,
  status,
  statusClass,
  children,
}: {
  icon: ElementType;
  title: string;
  value: string;
  suffix?: string;
  status?: string;
  statusClass?: string;
  children?: ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-panel/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <h3 className="text-[13px] font-medium text-foreground/90">{title}</h3>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
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
}

export function Sparkline({ data, color }: { data: number[]; color: string }) {
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

export function Gauge({
  value,
  label = "Health Score",
  status = "Healthy",
}: {
  value: number;
  label?: string;
  status?: string;
}) {
  const dash = 97.4;
  return (
    <div className="grid w-32 shrink-0 place-items-center rounded-lg border border-border bg-panel-elevated p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <div className="relative my-2 grid size-20 place-items-center">
        <svg viewBox="0 0 36 36" className="absolute size-20 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--secondary)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={dash}
            strokeDashoffset={dash * (1 - value / 100)}
          />
        </svg>
        <div className="text-center">
          <p className="font-display text-xl font-bold">{value}</p>
          <p className="text-[9px] text-muted-foreground">/100</p>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-success">
        <span className="size-1.5 rounded-full bg-success" /> {status}
      </p>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {badge && (
        <span className="flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-[11px] text-success">
          <span className="size-1.5 rounded-full bg-success" /> {badge}
        </span>
      )}
    </div>
  );
}
