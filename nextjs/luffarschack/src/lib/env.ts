function optional(value: string | undefined) {
  return value || undefined;
}

/** First non-empty string; treats "" as missing (unlike ??). */
function firstEnv(...values: Array<string | undefined>) {
  for (const value of values) {
    if (value) return value;
  }
  return undefined;
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function getServerTelemetryEnv() {
  return {
    serviceName: process.env.OTEL_SERVICE_NAME ?? "luffarschack",
    exporterUrl: optional(process.env.OTEL_EXPORTER_OTLP_ENDPOINT),
    publishableKey: optional(process.env.AIENT_PUBLISHABLE_KEY),
    // Align with @aient/sourcemaps / platform defaults; empty strings must not block fallbacks.
    commit: firstEnv(
      process.env.COMMIT_SHA,
      process.env.GITHUB_SHA,
      process.env.VERCEL_GIT_COMMIT_SHA,
      process.env.CI_COMMIT_SHA,
    ),
    branch: firstEnv(
      process.env.COMMIT_REF,
      process.env.GITHUB_REF_NAME,
      process.env.VERCEL_GIT_COMMIT_REF,
      process.env.CI_COMMIT_REF_NAME,
    ),
    // Prefer explicit Aient/Vercel env over NODE_ENV so preview ≠ production.
    environment: firstEnv(
      process.env.AIENT_ENV,
      process.env.VERCEL_ENV,
      process.env.NODE_ENV,
    ),
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