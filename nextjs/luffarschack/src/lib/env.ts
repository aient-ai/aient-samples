export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const BROWSER_TELEMETRY_ENV = {
  serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack",
  exporterUrl:
    process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ??
    "https://ingest.aient.ai",
  publishableKey: process.env.NEXT_PUBLIC_AIENT_PUBLISHABLE_KEY,
  release: {
    commit: process.env.NEXT_PUBLIC_COMMIT_SHA,
    branch: process.env.NEXT_PUBLIC_COMMIT_REF,
    environment: process.env.NEXT_PUBLIC_AIENT_ENV ?? process.env.NODE_ENV,
  },
} as const;

export function getServerTelemetryEnv() {
  return {
    serviceName: process.env.OTEL_SERVICE_NAME ?? "luffarschack",
    exporterUrl:
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "https://ingest.aient.ai",
    publishableKey: process.env.AIENT_PUBLISHABLE_KEY,
    release: {
      commit: process.env.COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA,
      branch: process.env.COMMIT_REF ?? process.env.VERCEL_GIT_COMMIT_REF,
      environment: process.env.AIENT_ENV ?? process.env.NODE_ENV,
    },
  } as const;
}