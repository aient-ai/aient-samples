import { spawnSync } from "node:child_process";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), false);

const isReleaseBuild = process.env.AIENT_ENV === "prod";

if (!process.env.AIENT_API_KEY) {
  if (isReleaseBuild) {
    throw new Error(
      "AIENT_API_KEY is required to upload source maps in production builds.",
    );
  }

  console.warn("Skipping Aient source-map upload: AIENT_API_KEY is not set.");
  process.exit(0);
}

const commit =
  process.env.COMMIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.CI_COMMIT_SHA;

if (!commit) {
  throw new Error(
    "COMMIT_SHA (or a supported CI commit variable) is required for source-map uploads.",
  );
}

const uploads = [
  {
    directory: ".next/static",
    service: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME || "luffarschack",
    bundlePrefix: "/_next/static",
  },
  {
    directory: ".next/server",
    service: process.env.OTEL_SERVICE_NAME || "luffarschack",
    bundlePrefix: "/.next/server",
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
      "--commit",
      commit,
      "--bundle-prefix",
      upload.bundlePrefix,
      "--fail-on-empty",
    ],
    { stdio: "inherit" },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}