/**
 * Allowed Origin CORS Scenario
 *
 * Required:
 *   TARGET_URL=https://example.com
 * Optional:
 *   CORS_ENDPOINT=/api/auth/status
 *   ALLOWED_ORIGIN=http://localhost:3000
 *
 * Example:
 *   TARGET_URL=http://localhost:8081 CORS_ENDPOINT=/api/auth/status ALLOWED_ORIGIN=http://localhost:3000 k6 run CT1801_CORS_ALLOWED_ORIGIN.js
 */
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  tags: { scenario: 'cors-allowed-origin' },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL;
  const endpoint = __ENV.CORS_ENDPOINT || '/api/auth/status';
  const allowedOrigin = __ENV.ALLOWED_ORIGIN || 'http://localhost:3000';

  if (!baseUrl) throw new Error('TARGET_URL is required');

  const url = `${baseUrl}${endpoint}`;

  const preflight = http.options(url, null, {
    headers: {
      Origin: allowedOrigin,
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });

  const acaoPreflight = preflight.headers['Access-Control-Allow-Origin'] || '';

  check(preflight, {
    'preflight allows configured origin': () => acaoPreflight === allowedOrigin,
  });
}
