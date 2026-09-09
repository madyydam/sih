import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ModulePage } from "@/components/ModulePage";

export const Route = createFileRoute("/astronaut-health")({
  head: () => ({
    meta: [
      { title: "Astronaut Health | ASTRA-X Mission Control" },
      {
        name: "description",
        content:
          "Crew bio-telemetry — heart rate, oxygen, stress indicators, sleep and cognitive performance for Astra-1 crew members.",
      },
    ],
  }),
  component: AstronautHealthPage,
});

function AstronautHealthPage() {
  return (
    <AppShell>
      <ModulePage kind="astronaut" />
    </AppShell>
  );
}
