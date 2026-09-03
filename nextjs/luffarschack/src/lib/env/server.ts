export const SERVER_TELEMETRY_ENV = {
  exporterUrl:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "https://ingest.aient.ai",
  publishableKey: process.env.AIENT_PUBLISHABLE_KEY,
  release: {
    branch:
      process.env.COMMIT_REF ||
      process.env.VERCEL_GIT_COMMIT_REF ||
      process.env.GITHUB_REF_NAME ||
      process.env.CI_COMMIT_REF_NAME,
    commit:
      process.env.COMMIT_SHA ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GITHUB_SHA ||
      process.env.CI_COMMIT_SHA,
    environment: process.env.AIENT_ENV || process.env.NODE_ENV,
  },
  serviceName: process.env.OTEL_SERVICE_NAME || "luffarschack",
};