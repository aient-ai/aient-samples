import { registerOTel } from "@aient/otel";
import { getServerTelemetryConfig } from "@/lib/env";

export function register() {
  registerOTel(getServerTelemetryConfig());
}