import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const isCI = process.env.CI === "true" || process.env.CI === "1";
const required = isCI || process.env.AIENT_SOURCEMAPS_REQUIRED === "true";
const commit = process.env.COMMIT_SHA;
const apiKey = process.env.AIENT_API_KEY;

if (!commit || !apiKey) {
  const missing = [
    !commit && "COMMIT_SHA",
    !apiKey && "AIENT_API_KEY",
  ].filter(Boolean);
  const message = `Source-map upload skipped: missing ${missing.join(" and ")}.`;

  if (required) {
    console.error(message);
    process.exit(1);
  }

  console.warn(`${message} Set AIENT_SOURCEMAPS_REQUIRED=true to require uploads.`);
  process.exit(0);
}

if (
  process.env.NEXT_PUBLIC_COMMIT_SHA &&
  process.env.NEXT_PUBLIC_COMMIT_SHA !== commit
) {
  console.error("NEXT_PUBLIC_COMMIT_SHA must match COMMIT_SHA for source mapping.");
  process.exit(1);
}

const commonArgs = ["--commit", commit, "--fail-on-empty"];
if (process.env.AIENT_SOURCEMAPS_DRY_RUN === "true") {
  commonArgs.push("--dry-run");
}

const uploads = [
  {
    directory: ".next/static",
    service: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack",
    bundlePrefix: "/_next/static",
  },
  {
    directory: ".next/server",
    service: process.env.OTEL_SERVICE_NAME ?? "luffarschack",
    bundlePrefix: resolve(".next/server").replaceAll("\\", "/"),
  },
];

for (const upload of uploads) {
  const result = spawnSync(
    "aient-sourcemaps",
    [
      "upload",
      upload.directory,
      "--service",
      upload.service,
      "--bundle-prefix",
      upload.bundlePrefix,
      ...commonArgs,
    ],
    { env: process.env, stdio: "inherit", shell: process.platform === "win32" },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}