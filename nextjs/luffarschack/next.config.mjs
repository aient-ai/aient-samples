import { dirname } from "path";
import { fileURLToPath } from "url";

/** First non-empty string; treats "" as missing (unlike ??). */
function firstEnv(...values) {
  for (const value of values) {
    if (value) return value;
  }
  return undefined;
}

const nextConfig = {
  productionBrowserSourceMaps: true,
  env: {
    NEXT_PUBLIC_COMMIT_SHA:
      firstEnv(
        process.env.NEXT_PUBLIC_COMMIT_SHA,
        process.env.COMMIT_SHA,
        process.env.GITHUB_SHA,
        process.env.VERCEL_GIT_COMMIT_SHA,
        process.env.CI_COMMIT_SHA,
      ) ?? "",
    NEXT_PUBLIC_COMMIT_REF:
      firstEnv(
        process.env.NEXT_PUBLIC_COMMIT_REF,
        process.env.COMMIT_REF,
        process.env.GITHUB_REF_NAME,
        process.env.VERCEL_GIT_COMMIT_REF,
        process.env.CI_COMMIT_REF_NAME,
      ) ?? "",
    NEXT_PUBLIC_AIENT_ENV:
      firstEnv(
        process.env.NEXT_PUBLIC_AIENT_ENV,
        process.env.AIENT_ENV,
        process.env.VERCEL_ENV,
        process.env.NEXT_PUBLIC_VERCEL_ENV,
        process.env.NODE_ENV,
      ),
  },
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;

