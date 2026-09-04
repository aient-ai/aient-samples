import { registerOTel } from "@aient/otel";

import { getServerTelemetryEnv } from "@/lib/env";

export function register() {
  registerOTel(getServerTelemetryEnv());
}