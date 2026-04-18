/**
 * Generic Permanent Failure Test (sc02-like)
 *
 * Required:
 *   TARGET_URL=https://example.com/health
 * Optional:
 *   K6_VUS, K6_DURATION
 *
 * Example:
 *   TARGET_URL=https://example.com/health K6_VUS=1 K6_DURATION=30s k6 run CT1201_EXCEPTION_HANDLING.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: Number(__ENV.K6_VUS || 1),
  duration: __ENV.K6_DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate>0.9'],
    http_req_duration: ['p(95)<5000'],
  },
  tags: { scenario: 'generic-permanent-failure' },
};

export default function () {
  const url = __ENV.TARGET_URL;
  if (!url) {
    throw new Error('TARGET_URL is required');
  }

  const res = http.get(url);
  check(res, {
    'request failed as expected': (r) => r.status === 0 || r.status >= 400,
  });

  sleep(1);
}
