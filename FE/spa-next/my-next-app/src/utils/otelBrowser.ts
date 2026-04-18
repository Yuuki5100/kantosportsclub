import type { NextWebVitalsMetric } from "next/app";

const isBrowser = () => typeof window !== "undefined";

const isTruthy = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  return value === "1" || value.toLowerCase() === "true";
};

const randomHex = (byteLength: number): string => {
  const bytes = new Uint8Array(byteLength);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
};

const otelHttpEndpoint = (): string => {
  const endpoint = process.env.NEXT_PUBLIC_OTEL_HTTP_ENDPOINT ?? "http://localhost:4318";
  return endpoint.endsWith("/v1/metrics") ? endpoint : `${endpoint.replace(/\/$/, "")}/v1/metrics`;
};

const otelServiceName = (): string => process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "frontend";

const nowUnixNano = (): string => (BigInt(Date.now()) * 1_000_000n).toString();

const metricName = (name: string): string => `web_vital_${name.toLowerCase()}`;

const sendMetricsPayload = async (payload: unknown): Promise<void> => {
  const endpoint = otelHttpEndpoint();
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const sent = navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    if (sent) {
      return;
    }
  }

  await fetch(endpoint, {
    method: "POST",
    mode: "cors",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
};

export const isWebVitalsEnabled = (): boolean =>
  isBrowser() && isTruthy(process.env.NEXT_PUBLIC_OTEL_WEB_VITALS_ENABLED, true);

export const isTraceparentEnabled = (): boolean =>
  isBrowser() && isTruthy(process.env.NEXT_PUBLIC_OTEL_TRACEPARENT_ENABLED, true);

export const buildTraceparentHeader = (): string | null => {
  if (!isTraceparentEnabled()) {
    return null;
  }
  const traceId = randomHex(16);
  const spanId = randomHex(8);
  const flags = isTruthy(process.env.NEXT_PUBLIC_OTEL_TRACE_SAMPLED, true) ? "01" : "00";
  return `00-${traceId}-${spanId}-${flags}`;
};

export const reportWebVitalToOtel = (metric: NextWebVitalsMetric): void => {
  if (!isWebVitalsEnabled() || !Number.isFinite(metric.value)) {
    return;
  }

  const timeUnixNano = nowUnixNano();
  const payload = {
    resourceMetrics: [
      {
        resource: {
          attributes: [
            {
              key: "service.name",
              value: { stringValue: otelServiceName() },
            },
            {
              key: "deployment.environment",
              value: { stringValue: process.env.NODE_ENV ?? "development" },
            },
          ],
        },
        scopeMetrics: [
          {
            scope: {
              name: "frontend.web-vitals",
            },
            metrics: [
              {
                name: metricName(metric.name),
                description: `Next.js Web Vital ${metric.name}`,
                unit: "ms",
                gauge: {
                  dataPoints: [
                    {
                      timeUnixNano,
                      asDouble: metric.value,
                      attributes: [
                        { key: "metric.id", value: { stringValue: metric.id } },
                        { key: "metric.label", value: { stringValue: metric.label ?? "unknown" } },
                        { key: "metric.rating", value: { stringValue: metric.rating ?? "unknown" } },
                        { key: "page.path", value: { stringValue: window.location.pathname } },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  };

  void sendMetricsPayload(payload).catch((error: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[otel] failed to send web vital", error);
    }
  });
};
