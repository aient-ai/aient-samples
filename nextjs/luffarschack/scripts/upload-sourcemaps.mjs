import { spawnSync } from "node:child_process";
import { join } from "node:path";

const isCi = ["1", "true"].includes((process.env.CI ?? "").toLowerCase());
const releaseEnvironment =
  process.env.AIENT_ENV ?? process.env.NEXT_PUBLIC_AIENT_ENV;
const isProduction = ["prod", "production"].includes(
  (releaseEnvironment ?? "").toLowerCase(),
);

if (!process.env.AIENT_API_KEY) {
  if (isCi || isProduction) {
    throw new Error(
      "AIENT_API_KEY is required to upload source maps in CI and production builds",
    );
  }

  console.warn("Skipping Aient source-map upload outside CI without AIENT_API_KEY");
  process.exit(0);
}

const commit = process.env.COMMIT_SHA;
if (!commit) {
  throw new Error("COMMIT_SHA is required to upload source maps");
}

if (
  process.env.NEXT_PUBLIC_COMMIT_SHA &&
  process.env.NEXT_PUBLIC_COMMIT_SHA !== commit
) {
  throw new Error("NEXT_PUBLIC_COMMIT_SHA must match COMMIT_SHA");
}

const executable = join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "aient-sourcemaps.cmd" : "aient-sourcemaps",
);

function upload(directory, service, bundlePrefix) {
  const result = spawnSync(
    executable,
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
    { env: process.env, stdio: "inherit" },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

upload(
  ".next/static",
  process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack",
  process.env.AIENT_BROWSER_BUNDLE_PREFIX ?? "/_next/static",
);
upload(
  ".next/server",
  process.env.OTEL_SERVICE_NAME ?? "luffarschack",
  process.env.AIENT_SERVER_BUNDLE_PREFIX ?? ".next/server",
);