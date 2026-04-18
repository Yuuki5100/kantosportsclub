/**
 * Authenticated Auth Status Scenario
 *
 * Required:
 *   TARGET_URL=https://example.com
 *   USERNAME, PASSWORD
 * Optional:
 *   STATUS_PATH=/api/auth/status
 *   EXPECTED_STATUS=200
 *   K6_VUS, K6_DURATION
 *
 * Example:
 *   TARGET_URL=http://localhost:8081 USERNAME=k6user01 PASSWORD=password123 STATUS_PATH=/api/auth/status k6 run CT1021_AUTH_STATUS_AUTHENTICATED.js
 */
import http, { expectedStatuses } from 'k6/http';
import { check, sleep } from 'k6';
import { login } from './auth_helper.js';

export const options = {
  vus: Number(__ENV.K6_VUS || 5),
  duration: __ENV.K6_DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
  },
  tags: { scenario: 'auth-status-authenticated' },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL;
  const statusPath = __ENV.STATUS_PATH || '/api/auth/status';
  const expectedStatus = Number(__ENV.EXPECTED_STATUS || 200);

  if (!baseUrl) throw new Error('TARGET_URL is required');

  const sessionCookie = login();
  const res = http.get(`${baseUrl}${statusPath}`, {
    headers: { Cookie: sessionCookie },
    responseCallback: expectedStatuses(expectedStatus),
  });

  check(res, {
    'authenticated status request succeeded': (r) => r.status === expectedStatus,
    'authenticated response contains user data': (r) =>
      (r.body || '').includes('"authenticated":true') &&
      ((r.body || '').includes('"user"') || (r.body || '').includes('"user_id"')),
  });

  sleep(1);
}
