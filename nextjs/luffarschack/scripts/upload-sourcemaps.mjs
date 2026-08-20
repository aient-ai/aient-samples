import { spawnSync } from "node:child_process";

const isProductionBuild = process.env.AIENT_ENV === "prod";

if (!isProductionBuild) {
  console.log("Skipping Aient source-map upload because AIENT_ENV is not prod.");
  process.exit(0);
}

const requiredEnvironment = [
  "AIENT_API_KEY",
  "AIENT_PUBLISHABLE_KEY",
  "COMMIT_SHA",
  "COMMIT_REF",
  "NEXT_PUBLIC_AIENT_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_COMMIT_SHA",
  "NEXT_PUBLIC_COMMIT_REF",
  "NEXT_PUBLIC_AIENT_ENV",
];
const missingEnvironment = requiredEnvironment.filter(
  (name) => !process.env[name],
);

if (missingEnvironment.length > 0) {
  throw new Error(
    `Aient production source-map upload requires: ${missingEnvironment.join(", ")}`,
  );
}

if (process.env.COMMIT_SHA !== process.env.NEXT_PUBLIC_COMMIT_SHA) {
  throw new Error("COMMIT_SHA and NEXT_PUBLIC_COMMIT_SHA must match.");
}

if (process.env.COMMIT_REF !== process.env.NEXT_PUBLIC_COMMIT_REF) {
  throw new Error("COMMIT_REF and NEXT_PUBLIC_COMMIT_REF must match.");
}

if (process.env.AIENT_ENV !== process.env.NEXT_PUBLIC_AIENT_ENV) {
  throw new Error("AIENT_ENV and NEXT_PUBLIC_AIENT_ENV must match.");
}

const commit = process.env.COMMIT_SHA;
const uploads = [
  {
    directory: ".next/static",
    service: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "luffarschack",
    bundlePrefix: "/_next/static",
  },
  {
    directory: ".next/server",
    service: process.env.OTEL_SERVICE_NAME ?? "luffarschack",
    bundlePrefix: process.env.AIENT_SERVER_BUNDLE_PREFIX ?? ".next/server",
  },
];

for (const { directory, service, bundlePrefix } of uploads) {
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "aient-sourcemaps",
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
    {
      env: process.env,
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}