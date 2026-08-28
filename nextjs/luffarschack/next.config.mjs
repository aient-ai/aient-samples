import { dirname } from "path";
import { fileURLToPath } from "url";

const releaseVariables = [
  ["NEXT_PUBLIC_COMMIT_SHA", ["COMMIT_SHA", "VERCEL_GIT_COMMIT_SHA"]],
  ["NEXT_PUBLIC_COMMIT_REF", ["COMMIT_REF", "VERCEL_GIT_COMMIT_REF"]],
  ["NEXT_PUBLIC_AIENT_ENV", ["AIENT_ENV"]],
];

const browserReleaseEnv = Object.fromEntries(
  releaseVariables.flatMap(([browserName, serverNames]) => {
    const browserValue = process.env[browserName];
    const serverName = serverNames.find((name) => process.env[name]);
    const serverValue = serverName ? process.env[serverName] : undefined;

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

