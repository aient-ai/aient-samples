import { registerOTel } from "@aient/otel";

import { getServerTelemetryEnv } from "@/lib/env";

export function register() {
  const telemetry = getServerTelemetryEnv();

  if (!telemetry.publishableKey) {
    return;
  }

  registerOTel(telemetry);
}