"use client";

import {
  registerOTelBrowser,
  type BrowserSDK,
} from "@aient/otel-browser";
import { useEffect, useRef } from "react";

import { BROWSER_TELEMETRY_ENV } from "@/lib/env";

export function TelemetryInit() {
  const sdkRef = useRef<BrowserSDK | null>(null);

  useEffect(() => {
    if (!BROWSER_TELEMETRY_ENV.publishableKey) {
      return;
    }

    const sdk = registerOTelBrowser({
      ...BROWSER_TELEMETRY_ENV,
      captureConsoleLogs: true,
    });
    sdkRef.current = sdk;

    return () => {
      if (sdkRef.current === sdk) {
        sdkRef.current = null;
      }
      void sdk.shutdown();
    };
  }, []);

  return null;
}