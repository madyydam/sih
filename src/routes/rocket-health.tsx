import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ModulePage } from "@/components/ModulePage";

export const Route = createFileRoute("/rocket-health")({
  head: () => ({
    meta: [
      { title: "Rocket Health | ASTRA-X Mission Control" },
      {
        name: "description",
        content:
          "Live rocket health telemetry — engine status, fuel metrics, structural health, temperature and pressure for the Astra-1 mission.",
      },
    ],
  }),
  component: RocketHealthPage,
});

function RocketHealthPage() {
  return (
    <AppShell>
      <ModulePage kind="rocket" />
    </AppShell>
  );
}
