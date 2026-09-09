import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ModulePage } from "@/components/ModulePage";

export const Route = createFileRoute("/mission-status")({
  head: () => ({
    meta: [
      { title: "Mission Status | ASTRA-X Mission Control" },
      {
        name: "description",
        content:
          "Astra-1 mission progress, objectives, timeline, current phase and system readiness overview.",
      },
    ],
  }),
  component: MissionStatusPage,
});

function MissionStatusPage() {
  return (
    <AppShell>
      <ModulePage kind="mission" />
    </AppShell>
  );
}
