import { dirname } from "path";
import { fileURLToPath } from "url";

const nextConfig = {
  productionBrowserSourceMaps: true,
  env: {
    NEXT_PUBLIC_COMMIT_SHA:
      process.env.NEXT_PUBLIC_COMMIT_SHA ?? process.env.COMMIT_SHA ?? "",
    NEXT_PUBLIC_COMMIT_REF:
      process.env.NEXT_PUBLIC_COMMIT_REF ?? process.env.COMMIT_REF ?? "",
    NEXT_PUBLIC_AIENT_ENV:
      process.env.NEXT_PUBLIC_AIENT_ENV ??
      process.env.AIENT_ENV ??
      process.env.NODE_ENV,
  },
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;

