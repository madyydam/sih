import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ModulePage } from "@/components/ModulePage";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts | ASTRA-X Mission Control" },
      {
        name: "description",
        content:
          "Mission alerts — critical, warning and info events with timestamps, severity and acknowledgement for Astra-1.",
      },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  return (
    <AppShell>
      <ModulePage kind="alerts" />
    </AppShell>
  );
}
