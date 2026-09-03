export const BROWSER_TELEMETRY_ENV = {
  exporterUrl:
    process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ||
    "https://ingest.aient.ai",
  publishableKey: process.env.NEXT_PUBLIC_AIENT_PUBLISHABLE_KEY,
  release: {
    branch: process.env.NEXT_PUBLIC_COMMIT_REF || undefined,
    commit: process.env.NEXT_PUBLIC_COMMIT_SHA || undefined,
    environment: process.env.NEXT_PUBLIC_AIENT_ENV || undefined,
  },
  serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME || "luffarschack",
};