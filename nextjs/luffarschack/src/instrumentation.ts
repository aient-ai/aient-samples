import { registerOTel } from "@aient/otel";
import { SERVER_TELEMETRY_ENV } from "@/lib/env/server";

export function register() {
  if (!SERVER_TELEMETRY_ENV.publishableKey) return;

  registerOTel({
    serviceName: SERVER_TELEMETRY_ENV.serviceName,
    exporterUrl: SERVER_TELEMETRY_ENV.exporterUrl,
    publishableKey: SERVER_TELEMETRY_ENV.publishableKey,
    release: SERVER_TELEMETRY_ENV.release,
  });
}