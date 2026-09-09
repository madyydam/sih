import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ModulePage } from "@/components/ModulePage";

export const Route = createFileRoute("/neuroscience")({
  head: () => ({
    meta: [
      { title: "Neuroscience | ASTRA-X Mission Control" },
      {
        name: "description",
        content:
          "Cognitive performance, brain activity, stress, circadian metrics and mission psychology for the Astra-1 crew.",
      },
    ],
  }),
  component: NeurosciencePage,
});

function NeurosciencePage() {
  return (
    <AppShell>
      <ModulePage kind="neuroscience" />
    </AppShell>
  );
}
