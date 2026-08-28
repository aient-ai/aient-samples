"use client";

import { useEffect, useRef } from "react";
import {
  registerOTelBrowser,
  type BrowserSDK,
} from "@aient/otel-browser";
import { browserTelemetryEnv } from "@/lib/env";

export function TelemetryInit() {
  const sdkRef = useRef<BrowserSDK | null>(null);

  useEffect(() => {
    const sdk = registerOTelBrowser({
      ...browserTelemetryEnv,
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