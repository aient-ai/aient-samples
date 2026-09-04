import { spawnSync } from "node:child_process";

const isDryRun = process.argv.includes("--dry-run");
const commit = process.env.COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA;
const browserCommit = process.env.NEXT_PUBLIC_COMMIT_SHA ?? commit;

if (!process.env.AIENT_API_KEY) {
  console.warn(
    "Skipping Aient source-map upload: AIENT_API_KEY is not configured.",
  );
  process.exit(0);
}

if (!commit) {
  throw new Error(
    "COMMIT_SHA (or VERCEL_GIT_COMMIT_SHA on Vercel) is required to upload source maps",
  );
}

if (browserCommit !== commit) {
  throw new Error(
    "NEXT_PUBLIC_COMMIT_SHA must match the source-map release commit",
  );
}

const command = process.platform === "win32" ? "aient-sourcemaps.cmd" : "aient-sourcemaps";

const uploads = [
  {
    directory: ".next/static",
    service: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack",
    bundlePrefix: "/_next/static",
  },
  {
    directory: ".next/server",
    service: process.env.OTEL_SERVICE_NAME ?? "luffarschack",
    bundlePrefix: ".next/server",
  },
];

for (const upload of uploads) {
  const args = [
    "upload",
    upload.directory,
    "--service",
    upload.service,
    "--commit",
    commit,
    "--bundle-prefix",
    upload.bundlePrefix,
    "--fail-on-empty",
  ];

  if (isDryRun) {
    args.push("--dry-run");
  }

  const result = spawnSync(command, args, {
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}