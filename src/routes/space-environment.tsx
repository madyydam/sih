import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ModulePage } from "@/components/ModulePage";

export const Route = createFileRoute("/space-environment")({
  head: () => ({
    meta: [
      { title: "Space Environment | ASTRA-X Mission Control" },
      {
        name: "description",
        content:
          "Radiation levels, solar activity, space weather, temperature, magnetic conditions and environmental risk for Astra-1.",
      },
    ],
  }),
  component: SpaceEnvironmentPage,
});

function SpaceEnvironmentPage() {
  return (
    <AppShell>
      <ModulePage kind="environment" />
    </AppShell>
  );
}
