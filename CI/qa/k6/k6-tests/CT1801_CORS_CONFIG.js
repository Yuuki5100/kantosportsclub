/**
 * Generic CORS Validation Test (sc09-like)
 *
 * Required:
 *   TARGET_URL=https://example.com
 * Optional:
 *   CORS_ENDPOINT=/api/auth/session-check
 *
 * Example:
 *   TARGET_URL=https://example.com CORS_ENDPOINT=/api/auth/session-check k6 run CT1801_CORS_CONFIG.js
 */
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  tags: { scenario: 'generic-cors' },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL;
  if (!baseUrl) throw new Error('TARGET_URL is required');

  const endpoint = __ENV.CORS_ENDPOINT || '/api/auth/session-check';
  const url = `${baseUrl}${endpoint}`;

  const evilOrigin = 'https://evil.example.com';

  const preflight = http.options(url, null, {
    headers: {
      Origin: evilOrigin,
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });

  const getEvil = http.get(url, {
    headers: {
      Origin: evilOrigin,
      'Content-Type': 'application/json',
    },
  });

  const acaoPreflight = preflight.headers['Access-Control-Allow-Origin'] || '';
  const acaoGet = getEvil.headers['Access-Control-Allow-Origin'] || '';

  check(preflight, {
    'preflight does not reflect evil origin': () => acaoPreflight !== evilOrigin,
  });

  check(getEvil, {
    'GET does not reflect evil origin': () => acaoGet !== evilOrigin,
  });
}
