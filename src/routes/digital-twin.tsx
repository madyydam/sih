import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ModulePage } from "@/components/ModulePage";

export const Route = createFileRoute("/digital-twin")({
  head: () => ({
    meta: [
      { title: "Digital Twin | ASTRA-X Mission Control" },
      {
        name: "description",
        content:
          "Synchronized spacecraft digital twin — real-time component health, telemetry, system model and interactive inspection for Astra-1.",
      },
    ],
  }),
  component: DigitalTwinPage,
});

function DigitalTwinPage() {
  return (
    <AppShell>
      <ModulePage kind="twin" />
    </AppShell>
  );
}
