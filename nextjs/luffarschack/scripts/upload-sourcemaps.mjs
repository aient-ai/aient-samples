import { spawnSync } from "node:child_process";

/** First non-empty string; treats "" as missing (unlike ??). */
function firstEnv(...values) {
  for (const value of values) {
    if (value) return value;
  }
  return undefined;
}

const isCI = process.env.CI === "true" || process.env.CI === "1";
const isVercelPreview = process.env.VERCEL_ENV === "preview";
const isVercelProduction = process.env.VERCEL_ENV === "production";
const required =
  process.env.AIENT_SOURCEMAPS_REQUIRED === "true" ||
  isVercelProduction ||
  (isCI && !isVercelPreview);
// Match @aient/sourcemaps CLI auto-detect order; empty COMMIT_SHA must not block fallbacks.
const commit = firstEnv(
  process.env.COMMIT_SHA,
  process.env.GITHUB_SHA,
  process.env.VERCEL_GIT_COMMIT_SHA,
  process.env.CI_COMMIT_SHA,
);
const apiKey = process.env.AIENT_API_KEY;
const browserCommit = firstEnv(process.env.NEXT_PUBLIC_COMMIT_SHA);

if (!commit || !apiKey) {
  const missing = [
    !commit &&
      "COMMIT_SHA, GITHUB_SHA, VERCEL_GIT_COMMIT_SHA, or CI_COMMIT_SHA",
    !apiKey && "AIENT_API_KEY",
  ].filter(Boolean);
  const message = `Source-map upload skipped: missing ${missing.join(" and ")}.`;

  if (required) {
    console.error(message);
    process.exit(1);
  }

  console.warn(
    `${message} Set AIENT_SOURCEMAPS_REQUIRED=true to require uploads.`,
  );
  process.exit(0);
}

if (browserCommit && browserCommit !== commit) {
  console.error(
    "NEXT_PUBLIC_COMMIT_SHA must match the release commit for source mapping.",
  );
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
    // Runtime stacks use a path suffix under .next/server, not the build-host absolute path.
    bundlePrefix: ".next/server",
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