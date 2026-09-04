const DEFAULT_AIENT_ENDPOINT = "https://ingest.aient.ai";
const DEFAULT_SERVICE_NAME = "glimt-app";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const browserTelemetryEnv = {
  serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? DEFAULT_SERVICE_NAME,
  exporterUrl:
    process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ?? DEFAULT_AIENT_ENDPOINT,
  publishableKey: process.env.NEXT_PUBLIC_AIENT_PUBLISHABLE_KEY,
  release: {
    commit: process.env.NEXT_PUBLIC_COMMIT_SHA,
    branch: process.env.NEXT_PUBLIC_COMMIT_REF,
    environment: process.env.NEXT_PUBLIC_AIENT_ENV,
  },
};

export function getServerTelemetryEnv() {
  return {
    serviceName: process.env.OTEL_SERVICE_NAME ?? DEFAULT_SERVICE_NAME,
    exporterUrl: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? DEFAULT_AIENT_ENDPOINT,
    publishableKey: process.env.AIENT_PUBLISHABLE_KEY,
    release: {
      commit: process.env.COMMIT_SHA,
      branch: process.env.COMMIT_REF,
      environment: process.env.AIENT_ENV ?? process.env.NODE_ENV,
    },
  };
}