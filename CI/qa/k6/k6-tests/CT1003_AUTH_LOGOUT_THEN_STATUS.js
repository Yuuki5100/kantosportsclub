/**
 * Logout Then Auth Status Scenario
 *
 * Required:
 *   TARGET_URL=https://example.com
 *   USERNAME, PASSWORD
 * Optional:
 *   LOGIN_PATH=/api/auth/login
 *   LOGOUT_PATH=/api/auth/logout
 *   STATUS_PATH=/api/auth/status
 *   EXPECTED_STATUS_BEFORE_LOGOUT=200
 *   EXPECTED_LOGOUT_STATUS=200
 *   EXPECTED_STATUS_AFTER_LOGOUT=403
 *   K6_VUS, K6_DURATION
 *
 * Example:
 *   TARGET_URL=http://localhost:8081 USERNAME=k6user01 PASSWORD=password123 EXPECTED_STATUS_AFTER_LOGOUT=401 k6 run CT1003_AUTH_LOGOUT_THEN_STATUS.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { expectedStatuses } from 'k6/http';
import { login } from './auth_helper.js';

export const options = {
  vus: Number(__ENV.K6_VUS || 1),
  duration: __ENV.K6_DURATION || '20s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
  tags: { scenario: 'auth-logout-then-status' },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL;
  const logoutPath = __ENV.LOGOUT_PATH || '/api/auth/logout';
  const statusPath = __ENV.STATUS_PATH || '/api/auth/status';
  const expectedBeforeLogout = Number(__ENV.EXPECTED_STATUS_BEFORE_LOGOUT || 200);
  const expectedLogout = Number(__ENV.EXPECTED_LOGOUT_STATUS || 200);
  const expectedAfterLogout = Number(__ENV.EXPECTED_STATUS_AFTER_LOGOUT || 403);

  if (!baseUrl) throw new Error('TARGET_URL is required');

  const sessionCookie = login();

  const beforeRes = http.get(`${baseUrl}${statusPath}`, { headers: { Cookie: sessionCookie } });
  check(beforeRes, {
    'status works before logout': (r) => r.status === expectedBeforeLogout,
  });

  const logoutRes = http.post(`${baseUrl}${logoutPath}`, null, { headers: { Cookie: sessionCookie } });
  check(logoutRes, {
    'logout request accepted': (r) => r.status === expectedLogout || r.status === 204,
  });

  const afterRes = http.get(`${baseUrl}${statusPath}`, {
    responseCallback: expectedStatuses(expectedAfterLogout),
  });
  check(afterRes, {
    'status is rejected without cookie after logout': (r) => r.status === expectedAfterLogout,
  });

  sleep(1);
}
