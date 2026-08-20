import { registerOTel } from "@aient/otel";
import { SERVER_TELEMETRY } from "./src/lib/env";

export function register() {
  if (!SERVER_TELEMETRY.publishableKey) return;

  registerOTel({
    serviceName: SERVER_TELEMETRY.serviceName,
    publishableKey: SERVER_TELEMETRY.publishableKey,
    exporterUrl: SERVER_TELEMETRY.exporterUrl,
    release: SERVER_TELEMETRY.release,
  });
}
