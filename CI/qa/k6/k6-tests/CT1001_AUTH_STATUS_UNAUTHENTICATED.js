/**
 * Unauthenticated Auth Status Scenario
 *
 * Required:
 *   TARGET_URL=https://example.com
 * Optional:
 *   STATUS_PATH=/api/auth/status
 *   EXPECTED_STATUS=403
 *   K6_VUS, K6_DURATION
 *
 * Example:
 *   TARGET_URL=http://localhost:8081 STATUS_PATH=/api/auth/status EXPECTED_STATUS=401 k6 run CT1001_AUTH_STATUS_UNAUTHENTICATED.js
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
  tags: { scenario: 'auth-status-unauthenticated' },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL;
  const statusPath = __ENV.STATUS_PATH || '/api/auth/status';
  const expectedStatus = Number(__ENV.EXPECTED_STATUS || 403);

  if (!baseUrl) throw new Error('TARGET_URL is required');

  const res = http.get(`${baseUrl}${statusPath}`, {
    responseCallback: expectedStatuses(expectedStatus),
  });

  check(res, {
    'unauthenticated status is rejected': (r) => r.status === expectedStatus,
  });

  sleep(1);
}
