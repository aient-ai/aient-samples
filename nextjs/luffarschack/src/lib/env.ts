function optional(value: string | undefined) {
  return value || undefined;
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function getServerTelemetryEnv() {
  return {
    serviceName: process.env.OTEL_SERVICE_NAME ?? "luffarschack",
    exporterUrl: optional(process.env.OTEL_EXPORTER_OTLP_ENDPOINT),
    publishableKey: optional(process.env.AIENT_PUBLISHABLE_KEY),
    commit: optional(process.env.COMMIT_SHA),
    branch: optional(process.env.COMMIT_REF),
    environment: optional(process.env.AIENT_ENV ?? process.env.NODE_ENV),
  };
}

export const browserTelemetryEnv = {
  serviceName: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack",
  exporterUrl: optional(process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT),
  publishableKey: optional(process.env.NEXT_PUBLIC_AIENT_PUBLISHABLE_KEY),
  commit: optional(process.env.NEXT_PUBLIC_COMMIT_SHA),
  branch: optional(process.env.NEXT_PUBLIC_COMMIT_REF),
  environment: optional(process.env.NEXT_PUBLIC_AIENT_ENV),
};