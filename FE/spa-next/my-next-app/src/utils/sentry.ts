// src/utils/sentry.ts
import * as Sentry from "@sentry/nextjs";

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// ★ DSNが http(s) で始まるなど最低限のバリデーションを追加
const isValidDsn = typeof sentryDsn === 'string' && /^https?:\/\/.+/.test(sentryDsn);

if (isValidDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    debug: process.env.NEXT_PUBLIC_LOG_LEVEL === "debug",
  });
}

export function addBreadcrumb(breadcrumb: Parameters<typeof Sentry.addBreadcrumb>[0]) {
  Sentry.addBreadcrumb(breadcrumb);
}

export function captureException(error: unknown) {
  Sentry.captureException(error);
}

export default Sentry;
