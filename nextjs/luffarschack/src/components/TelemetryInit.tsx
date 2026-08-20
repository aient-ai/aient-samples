"use client";

import { registerOTelBrowser, type BrowserSDK } from "@aient/otel-browser";
import { useEffect, useRef } from "react";
import { BROWSER_TELEMETRY } from "@/lib/env";

export default function TelemetryInit() {
  const sdkRef = useRef<BrowserSDK | null>(null);

  useEffect(() => {
    if (!BROWSER_TELEMETRY.publishableKey) return;

    const sdk = registerOTelBrowser({
      serviceName: BROWSER_TELEMETRY.serviceName,
      publishableKey: BROWSER_TELEMETRY.publishableKey,
      exporterUrl: BROWSER_TELEMETRY.exporterUrl,
      release: BROWSER_TELEMETRY.release,
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