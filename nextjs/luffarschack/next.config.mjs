import { dirname } from "path";
import { fileURLToPath } from "url";

const commitSha =
  process.env.NEXT_PUBLIC_COMMIT_SHA ||
  process.env.COMMIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.CI_COMMIT_SHA ||
  "";

const commitRef =
  process.env.NEXT_PUBLIC_COMMIT_REF ||
  process.env.COMMIT_REF ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.GITHUB_REF_NAME ||
  process.env.CI_COMMIT_REF_NAME ||
  "";

const nextConfig = {
  env: {
    NEXT_PUBLIC_AIENT_ENV:
      process.env.NEXT_PUBLIC_AIENT_ENV || process.env.AIENT_ENV || "",
    NEXT_PUBLIC_COMMIT_REF: commitRef,
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
  },
  experimental: {
    serverSourceMaps: true,
  },
  productionBrowserSourceMaps: true,
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;

