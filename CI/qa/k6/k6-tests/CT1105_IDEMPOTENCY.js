/**
 * Generic Idempotency Test (sc02-like)
 *
 * Required:
 *   TARGET_URL=https://example.com/api/submit
 *   PAYLOAD_JSON={"id":"123","value":"abc"}
 * Optional:
 *   K6_VUS, K6_DURATION, EXPECTED_STATUS
 *
 * Example:
 *   TARGET_URL=https://example.com/api/submit PAYLOAD_JSON='{"id":"123","value":"abc"}' K6_VUS=1 K6_DURATION=30s k6 run CT1105_IDEMPOTENCY.js
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
  tags: { scenario: 'generic-idempotency' },
};

export default function () {
  const url = __ENV.TARGET_URL;
  if (!url) {
    throw new Error('TARGET_URL is required');
  }

  const payload = __ENV.PAYLOAD_JSON || '{}';
  const expected = Number(__ENV.EXPECTED_STATUS || 200);
  const params = { headers: { 'Content-Type': 'application/json' } };

  const res1 = http.post(url, payload, params);
  check(res1, { 'first request ok': (r) => r.status === expected });

  sleep(1);

  const res2 = http.post(url, payload, params);
  check(res2, { 'second request ok (idempotent)': (r) => r.status === expected });
}
