import { registerOTel } from "@aient/otel";
import { serverTelemetryEnv } from "@/lib/env";

export function register() {
  registerOTel(serverTelemetryEnv);
}