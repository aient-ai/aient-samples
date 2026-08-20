export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SERVER_TELEMETRY = {
  serviceName: process.env.OTEL_SERVICE_NAME ?? "luffarschack",
  publishableKey: process.env.AIENT_PUBLISHABLE_KEY,
  exporterUrl:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "https://ingest.aient.ai",
  release: {
    commit: process.env.COMMIT_SHA,
    branch: process.env.COMMIT_REF,
    environment: process.env.AIENT_ENV ?? process.env.NODE_ENV,
  },
} as const;

export const BROWSER_TELEMETRY = {
  serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack",
  publishableKey: process.env.NEXT_PUBLIC_AIENT_PUBLISHABLE_KEY,
  exporterUrl:
    process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ??
    "https://ingest.aient.ai",
  release: {
    commit: process.env.NEXT_PUBLIC_COMMIT_SHA,
    branch: process.env.NEXT_PUBLIC_COMMIT_REF,
    environment: process.env.NEXT_PUBLIC_AIENT_ENV,
  },
} as const;