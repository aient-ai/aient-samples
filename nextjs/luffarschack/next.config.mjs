import { dirname } from "path";
import { fileURLToPath } from "url";

const nextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    // Also retain server maps if this app is built with webpack instead of Turbopack.
    serverSourceMaps: true,
  },
  // Bake the deployed build's release into both surfaces. Build-process env alone
  // does not survive `next start` or a serverless deployment.
  env: {
    COMMIT_SHA: process.env.COMMIT_SHA,
    COMMIT_REF: process.env.COMMIT_REF,
    AIENT_ENV: process.env.AIENT_ENV,
    NEXT_PUBLIC_COMMIT_SHA: process.env.NEXT_PUBLIC_COMMIT_SHA,
    NEXT_PUBLIC_COMMIT_REF: process.env.NEXT_PUBLIC_COMMIT_REF,
    NEXT_PUBLIC_AIENT_ENV: process.env.NEXT_PUBLIC_AIENT_ENV,
  },
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;

