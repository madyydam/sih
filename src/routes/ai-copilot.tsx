import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ModulePage } from "@/components/ModulePage";

export const Route = createFileRoute("/ai-copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot | ASTRA-X Mission Control" },
      {
        name: "description",
        content:
          "AI-powered mission assistant — ask questions, get recommendations, system insights and anomaly explanations for Astra-1.",
      },
    ],
  }),
  component: AICopilotPage,
});

function AICopilotPage() {
  return (
    <AppShell>
      <ModulePage kind="copilot" />
    </AppShell>
  );
}
