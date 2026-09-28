"use client";

import { useEffect, useRef } from "react";
import { trace } from "@opentelemetry/api";
import { SeverityNumber } from "@opentelemetry/api-logs";
import {
  registerOTelBrowser,
  type BrowserSDK,
} from "@aient/otel-browser";
import { BROWSER_TELEMETRY } from "@/lib/env";
import { resolveBrowserIdentity } from "@/lib/browserIdentity";

let activeSdk: BrowserSDK | null = null;

export default function TelemetryInit() {
  const sdkRef = useRef<BrowserSDK | null>(null);

  useEffect(() => {
    const identity = resolveBrowserIdentity();

    if (activeSdk) {
      void activeSdk.shutdown();
    }

    const sdk = registerOTelBrowser({
      ...BROWSER_TELEMETRY,
      captureConsoleLogs: true,
      installationId: identity.installationId,
      user: { pseudoId: identity.pseudoId },
    });
    activeSdk = sdk;
    sdkRef.current = sdk;

    trace
      .getTracer("luffarschack.telemetry")
      .startSpan("telemetry.initialized")
      .end();
    sdk.getLogger("luffarschack.telemetry").emit({
      severityNumber: SeverityNumber.INFO,
      body: "telemetry.initialized",
    });

    return () => {
      if (activeSdk === sdk) {
        activeSdk = null;
      }
      if (sdkRef.current === sdk) {
        sdkRef.current = null;
      }
      void sdk.shutdown();
    };
  }, []);

  return null;
}