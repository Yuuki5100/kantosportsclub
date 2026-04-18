import type { Request } from "@playwright/test";

export type JsonBody = Record<string, unknown>;

export type RequestCapture = (request: Request) => void;

export type RequestCaptureOptions = {
  capture?: RequestCapture;
};

export type DelayedRequestCaptureOptions = RequestCaptureOptions & {
  delayMs?: number;
};
