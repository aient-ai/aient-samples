import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

if (!process.env.AIENT_API_KEY) {
  console.log(
    "Skipping Aient source-map upload because AIENT_API_KEY is not configured.",
  );
  process.exit(0);
}

const commit = process.env.COMMIT_SHA;
const browserCommit = process.env.NEXT_PUBLIC_COMMIT_SHA;

if (!commit) {
  throw new Error("COMMIT_SHA is required when uploading Aient source maps.");
}

if (browserCommit !== commit) {
  throw new Error(
    "NEXT_PUBLIC_COMMIT_SHA must equal COMMIT_SHA when uploading Aient source maps.",
  );
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const executable = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "aient-sourcemaps.cmd" : "aient-sourcemaps",
);

const uploads = [
  {
    directory: ".next/static",
    service: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack-web",
    bundlePrefix: "/_next/static",
  },
  {
    directory: ".next/server",
    service: process.env.OTEL_SERVICE_NAME ?? "luffarschack",
    bundlePrefix: ".next/server",
  },
];

for (const upload of uploads) {
  const result = spawnSync(
    executable,
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
    { cwd: projectRoot, env: process.env, stdio: "inherit" },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}