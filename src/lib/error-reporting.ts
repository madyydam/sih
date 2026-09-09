export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[ASTRA-X Mission Telemetry Error]", error, context);
}
