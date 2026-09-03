"use client";

import { useEffect, useRef } from "react";
import {
  registerOTelBrowser,
  type BrowserSDK,
} from "@aient/otel-browser";
import { BROWSER_TELEMETRY_ENV } from "@/lib/env/browser";

export default function TelemetryInit() {
  const sdkRef = useRef<BrowserSDK | null>(null);

  useEffect(() => {
    if (!BROWSER_TELEMETRY_ENV.publishableKey) return;

    const sdk = registerOTelBrowser({
      serviceName: BROWSER_TELEMETRY_ENV.serviceName,
      exporterUrl: BROWSER_TELEMETRY_ENV.exporterUrl,
      publishableKey: BROWSER_TELEMETRY_ENV.publishableKey,
      release: BROWSER_TELEMETRY_ENV.release,
      captureConsoleLogs: true,
    });
    sdkRef.current = sdk;

    return () => {
      if (sdkRef.current === sdk) sdkRef.current = null;
      void sdk.shutdown();
    };
  }, []);

  return null;
}