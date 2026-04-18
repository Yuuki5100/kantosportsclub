/**
 * Generic Authenticated JSON API Load Test (POST/PUT)
 *
 * Required:
 *   TARGET_URL=https://example.com
 *   USERNAME, PASSWORD
 *   ENDPOINT_PATH=/api/resource
 *   METHOD=POST|PUT
 * Optional:
 *   PAYLOAD_JSON={"id":"123"}
 *   LOGIN_PATH=/api/auth/login
 *   EXPECTED_STATUS=200
 *   K6_VUS, K6_DURATION
 *
 * Example:
 *   TARGET_URL=https://example.com USERNAME=user PASSWORD=pass ENDPOINT_PATH=/api/resource METHOD=POST \
 *   PAYLOAD_JSON='{"id":"123"}' K6_VUS=5 K6_DURATION=1m k6 run CT1701_AUTH_JSON_LOAD.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { login } from './auth_helper.js';

export const options = {
  vus: Number(__ENV.K6_VUS || 10),
  duration: __ENV.K6_DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
  },
  tags: { scenario: 'generic-auth-json' },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL;
  const endpointPath = __ENV.ENDPOINT_PATH;
  const method = (__ENV.METHOD || 'POST').toUpperCase();

  if (!baseUrl) throw new Error('TARGET_URL is required');
  if (!endpointPath) throw new Error('ENDPOINT_PATH is required');
  if (method !== 'POST' && method !== 'PUT') throw new Error('METHOD must be POST or PUT');

  const payload = __ENV.PAYLOAD_JSON || '{}';
  const expected = Number(__ENV.EXPECTED_STATUS || 200);

  const sessionCookie = login();
  const headers = {
    Cookie: sessionCookie,
    'Content-Type': 'application/json',
  };

  const url = `${baseUrl}${endpointPath}`;
  const res = method === 'POST'
    ? http.post(url, payload, { headers })
    : http.put(url, payload, { headers });

  check(res, {
    'status matches expected': (r) => r.status === expected,
  });

  sleep(1);
}
