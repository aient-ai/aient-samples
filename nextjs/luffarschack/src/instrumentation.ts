import { registerOTel } from "@aient/otel";
import { getServerTelemetryEnv } from "@/lib/env";

export function register() {
  const serverTelemetryEnv = getServerTelemetryEnv();

  registerOTel({
    serviceName: serverTelemetryEnv.serviceName,
    exporterUrl: serverTelemetryEnv.exporterUrl,
    publishableKey: serverTelemetryEnv.publishableKey,
    release: {
      commit: serverTelemetryEnv.commit,
      branch: serverTelemetryEnv.branch,
      environment: serverTelemetryEnv.environment,
    },
  });
}