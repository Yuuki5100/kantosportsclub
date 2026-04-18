/**
 * Invalid Password Login Scenario
 *
 * Required:
 *   TARGET_URL=https://example.com
 *   USERNAME
 * Optional:
 *   BAD_PASSWORD=wrong-password
 *   LOGIN_PATH=/api/auth/login
 *   EXPECTED_STATUS=401
 *   K6_VUS, K6_DURATION
 *
 * Example:
 *   TARGET_URL=http://localhost:8081 USERNAME=k6user01 BAD_PASSWORD=wrong-password EXPECTED_STATUS=401 k6 run CT1001_AUTH_LOGIN_INVALID_PASSWORD.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { expectedStatuses } from 'k6/http';

export const options = {
  vus: Number(__ENV.K6_VUS || 1),
  duration: __ENV.K6_DURATION || '15s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
  tags: { scenario: 'auth-login-invalid-password' },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL;
  const username = __ENV.USERNAME;
  const badPassword = __ENV.BAD_PASSWORD || 'wrong-password';
  const loginPath = __ENV.LOGIN_PATH || '/api/auth/login';
  const expectedStatus = Number(__ENV.EXPECTED_STATUS || 401);

  if (!baseUrl) throw new Error('TARGET_URL is required');
  if (!username) throw new Error('USERNAME is required');

  const payload = JSON.stringify({ user_id: username, password: badPassword, saveCookieFlag: false });
  const params = {
    headers: { 'Content-Type': 'application/json' },
    responseCallback: expectedStatuses(expectedStatus),
  };

  const res = http.post(`${baseUrl}${loginPath}`, payload, params);

  check(res, {
    'invalid password is rejected': (r) => r.status === expectedStatus,
    'no auth cookie issued': (r) => !(r.headers['Set-Cookie'] || '').includes('ACCESS_TOKEN='),
  });

  sleep(1);
}
