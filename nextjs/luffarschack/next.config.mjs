import { dirname } from "path";
import { fileURLToPath } from "url";

const releaseVariables = [
  ["NEXT_PUBLIC_COMMIT_SHA", "COMMIT_SHA"],
  ["NEXT_PUBLIC_COMMIT_REF", "COMMIT_REF"],
  ["NEXT_PUBLIC_AIENT_ENV", "AIENT_ENV"],
];

const browserReleaseEnv = Object.fromEntries(
  releaseVariables.flatMap(([browserName, serverName]) => {
    const browserValue = process.env[browserName];
    const serverValue = process.env[serverName];

    if (browserValue && serverValue && browserValue !== serverValue) {
      throw new Error(`${browserName} must match ${serverName}`);
    }

    const value = browserValue ?? serverValue;
    return value ? [[browserName, value]] : [];
  }),
);

const nextConfig = {
  productionBrowserSourceMaps: true,
  env: browserReleaseEnv,
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;

