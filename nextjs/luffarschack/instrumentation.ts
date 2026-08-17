import { registerOTel } from "@aient/otel";

// Server-side OpenTelemetry registration for Next.js
// Reads configuration from env vars per repository convention and Aient contract.
registerOTel({
  serviceName: process.env.OTEL_SERVICE_NAME ?? process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack",
  publishableKey: process.env.AIENT_PUBLISHABLE_KEY,
  exporterUrl: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "https://ingest.aient.ai",
  release: {
    commit: process.env.COMMIT_SHA,
    branch: process.env.COMMIT_REF,
    environment: process.env.AIENT_ENV,
  },
});

// Note: For browser instrumentation, call registerOTelBrowser from a client entry
// point (e.g., in a custom _app or layout client component) using
// NEXT_PUBLIC_AIENT_PUBLISHABLE_KEY and NEXT_PUBLIC_* env vars.
