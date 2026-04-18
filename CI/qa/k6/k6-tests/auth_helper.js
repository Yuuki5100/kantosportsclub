/**
 * Auth helper (generic)
 *
 * Required:
 *   TARGET_URL=https://example.com
 *   USERNAME, PASSWORD
 * Optional:
 *   LOGIN_PATH=/api/auth/login
 */
import http from 'k6/http';

export function login() {
  const baseUrl = __ENV.TARGET_URL;
  const username = __ENV.USERNAME;
  const password = __ENV.PASSWORD;

  if (!baseUrl) throw new Error('TARGET_URL is required');
  if (!username || !password) throw new Error('USERNAME and PASSWORD are required');

  const loginPath = __ENV.LOGIN_PATH || '/api/auth/login';
  const payload = JSON.stringify({ username, password, saveCookieFlag: false });
  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(`${baseUrl}${loginPath}`, payload, params);
  let sessionCookie = '';

  if (res.cookies && res.cookies.JSESSIONID) {
    sessionCookie = `JSESSIONID=${res.cookies.JSESSIONID[0].value}`;
  } else if (res.headers['Set-Cookie']) {
    sessionCookie = res.headers['Set-Cookie'].split(';')[0];
  }

  if (!sessionCookie) {
    throw new Error('Login failed: session cookie not found');
  }

  return sessionCookie;
}
