/**
 * Generic Authenticated GET Load Test (sc04-like)
 *
 * Required:
 *   TARGET_URL=https://example.com
 * Optional:
 *   LOGIN_PATH=/api/auth/login
 *   ENDPOINT_PATH=/api/health
 *   QUERY_STRING=?a=1&b=2
 *   USERNAME, PASSWORD
 *   K6_VUS, K6_DURATION
 *
 * Example:
 *   TARGET_URL=https://example.com USERNAME=user PASSWORD=pass ENDPOINT_PATH=/api/health K6_VUS=5 K6_DURATION=1m k6 run CT1103_AUTH_GET_LIST.js
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
  tags: { scenario: 'generic-auth-get' },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL;
  const endpointPath = __ENV.ENDPOINT_PATH || '/api/health';
  const queryString = __ENV.QUERY_STRING || '';

  const sessionCookie = login();
  const headers = { Cookie: sessionCookie };

  const url = `${baseUrl}${endpointPath}${queryString}`;
  const res = http.get(url, { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
