"use client";

import {
  registerOTelBrowser,
  type BrowserSDK,
} from "@aient/otel-browser";
import { useEffect, useRef } from "react";
import { browserTelemetryConfig } from "@/lib/env";

export function TelemetryInit() {
  const sdkRef = useRef<BrowserSDK | null>(null);

  useEffect(() => {
    const sdk = registerOTelBrowser({
      ...browserTelemetryConfig,
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