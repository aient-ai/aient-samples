import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import nextEnv from "@next/env";

// Match Next production builds before reading release metadata or upload credentials.
nextEnv.loadEnvConfig(process.cwd(), false);

const isVercelPreview =
  process.env.VERCEL === "1" && process.env.VERCEL_ENV === "preview";
const commit = process.env.COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA;
const branch = process.env.COMMIT_REF || process.env.VERCEL_GIT_COMMIT_REF;
const environment =
  process.env.AIENT_ENV ||
  (process.env.VERCEL_ENV === "production"
    ? "prod"
    : process.env.VERCEL_ENV) ||
  "prod";

if (!commit) {
  throw new Error(
    "COMMIT_SHA or VERCEL_GIT_COMMIT_SHA is required for release metadata and source-map uploads.",
  );
}

if (!/^[0-9a-f]{40}$/.test(commit)) {
  throw new Error("Release commit must be a full 40-character Git SHA.");
}

if (
  process.env.NEXT_PUBLIC_COMMIT_SHA &&
  process.env.NEXT_PUBLIC_COMMIT_SHA !== commit
) {
  throw new Error(
    "NEXT_PUBLIC_COMMIT_SHA must match COMMIT_SHA or VERCEL_GIT_COMMIT_SHA.",
  );
}

const buildEnv = {
  ...process.env,
  COMMIT_SHA: commit,
  COMMIT_REF: branch,
  BUILD_DATE: process.env.BUILD_DATE || new Date().toISOString(),
  NEXT_PUBLIC_COMMIT_SHA: commit,
  NEXT_PUBLIC_COMMIT_REF: process.env.NEXT_PUBLIC_COMMIT_REF || branch,
  AIENT_ENV: environment,
  NEXT_PUBLIC_AIENT_ENV:
    process.env.NEXT_PUBLIC_AIENT_ENV || environment,
};

// An upload-scoped secret is not runtime configuration. Only the uploader needs it.
const { AIENT_API_KEY: uploadKey, ...runtimeBuildEnv } = buildEnv;

if (!uploadKey && !isVercelPreview) {
  throw new Error(
    "AIENT_API_KEY is required to upload source maps from the production build.",
  );
}

run("next", ["build"], runtimeBuildEnv);

if (!uploadKey) {
  console.warn(
    "Skipping Aient source-map upload because AIENT_API_KEY is not configured for this Vercel preview. Production deployments still require it.",
  );
} else {
  const browserService =
    buildEnv.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack";
  const serverService = buildEnv.OTEL_SERVICE_NAME ?? "luffarschack";

  upload(".next/static", browserService, "/_next/static");
  upload(
    ".next/server",
    serverService,
    buildEnv.AIENT_SERVER_BUNDLE_PREFIX ||
      (buildEnv.VERCEL === "1" ? "/var/task/.next/server" : resolve(".next/server")),
  );
}

function upload(directory, service, bundlePrefix) {
  run(
    "aient-sourcemaps",
    [
      "upload",
      directory,
      "--service",
      service,
      "--commit",
      commit,
      "--bundle-prefix",
      bundlePrefix,
      "--fail-on-empty",
    ],
    buildEnv,
  );
}

function run(command, args, env) {
  const executable =
    process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, { env, stdio: "inherit" });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}