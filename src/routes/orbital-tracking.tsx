import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ModulePage } from "@/components/ModulePage";

export const Route = createFileRoute("/orbital-tracking")({
  head: () => ({
    meta: [
      { title: "Orbital Tracking | ASTRA-X Mission Control" },
      {
        name: "description",
        content:
          "Live spacecraft position, orbit path, altitude, velocity, coordinates and ground-track data for Astra-1.",
      },
    ],
  }),
  component: OrbitalTrackingPage,
});

function OrbitalTrackingPage() {
  return (
    <AppShell>
      <ModulePage kind="orbit" />
    </AppShell>
  );
}
