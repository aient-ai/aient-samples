export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const browserTelemetryConfig = {
  serviceName:
    process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack-web",
  exporterUrl: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT,
  publishableKey: process.env.NEXT_PUBLIC_AIENT_PUBLISHABLE_KEY,
  release: {
    commit: process.env.NEXT_PUBLIC_COMMIT_SHA,
    branch: process.env.NEXT_PUBLIC_COMMIT_REF,
    environment:
      process.env.NEXT_PUBLIC_AIENT_ENV ?? process.env.NODE_ENV,
  },
} as const;

export function getServerTelemetryConfig() {
  return {
    serviceName: process.env.OTEL_SERVICE_NAME ?? "luffarschack",
    exporterUrl: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    publishableKey: process.env.AIENT_PUBLISHABLE_KEY,
    release: {
      commit: process.env.COMMIT_SHA,
      branch: process.env.COMMIT_REF,
      environment: process.env.AIENT_ENV ?? process.env.NODE_ENV,
    },
  } as const;
}