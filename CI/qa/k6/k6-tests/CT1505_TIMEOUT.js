/**
 * Generic Timeout/Latency Tolerance Test (sc02-like)
 *
 * Required:
 *   TARGET_URL=https://example.com/health
 * Optional:
 *   K6_VUS, K6_DURATION, TIMEOUT_MS, EXPECTED_STATUS
 *
 * Example:
 *   TARGET_URL=https://example.com/health TIMEOUT_MS=500 K6_VUS=1 K6_DURATION=30s k6 run CT1505_TIMEOUT.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: Number(__ENV.K6_VUS || 1),
  duration: __ENV.K6_DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
  },
  tags: { scenario: 'generic-timeout' },
};

export default function () {
  const url = __ENV.TARGET_URL;
  if (!url) {
    throw new Error('TARGET_URL is required');
  }

  const timeoutMs = __ENV.TIMEOUT_MS || '1000';
  const expected = Number(__ENV.EXPECTED_STATUS || 200);

  // Force timeout once, then retry normally
  const res1 = http.get(url, { timeout: `${timeoutMs}ms` });
  check(res1, { 'forced timeout occurred': (r) => r.error === 'timeout' });

  sleep(1);

  const res2 = http.get(url);
  check(res2, { 'retry succeeded': (r) => r.status === expected });
}
