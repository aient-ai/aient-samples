import { dirname } from "path";
import { fileURLToPath } from "url";

const nextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    serverSourceMaps: true,
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA:
      process.env.NEXT_PUBLIC_COMMIT_SHA ??
      process.env.COMMIT_SHA ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      "",
    NEXT_PUBLIC_COMMIT_REF:
      process.env.NEXT_PUBLIC_COMMIT_REF ??
      process.env.COMMIT_REF ??
      process.env.VERCEL_GIT_COMMIT_REF ??
      "",
    NEXT_PUBLIC_AIENT_ENV:
      process.env.NEXT_PUBLIC_AIENT_ENV ?? process.env.AIENT_ENV ?? "",
  },
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;

