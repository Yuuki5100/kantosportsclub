/**
 * Generic File Upload Validation Test (sc09-like)
 *
 * Required:
 *   TARGET_URL=https://example.com
 * Optional:
 *   LOGIN_PATH=/api/auth/login
 *   UPLOAD_PATH=/api/upload
 *   FORM_FIELD=file
 *   USERNAME, PASSWORD
 *
 * Example:
 *   TARGET_URL=https://example.com USERNAME=user PASSWORD=pass UPLOAD_PATH=/api/upload FORM_FIELD=file k6 run CT1502_UPLOAD_CONTENT_TYPE.js
 */
import http from 'k6/http';
import { check } from 'k6';
import { login } from './auth_helper.js';

export const options = {
  vus: 1,
  iterations: 1,
  tags: { scenario: 'generic-upload-validation' },
};

export default function () {
  const baseUrl = __ENV.TARGET_URL;
  const uploadPath = __ENV.UPLOAD_PATH || '/api/upload';
  const formField = __ENV.FORM_FIELD || 'file';

  const sessionCookie = login();
  const headers = { Cookie: sessionCookie };

  const uploadUrl = `${baseUrl}${uploadPath}`;

  const allowed = http.file('PK\x03\x04', 'ok.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  const exe = http.file('MZ\x90\x00', 'bad.exe', 'application/octet-stream');

  const okPayload = { [formField]: allowed };
  const badPayload = { [formField]: exe };

  const okRes = http.post(uploadUrl, okPayload, { headers });
  const badRes = http.post(uploadUrl, badPayload, { headers });

  check(okRes, {
    'allowed file accepted (not 4xx/5xx)': (r) => r.status < 400,
  });

  check(badRes, {
    'blocked file rejected (4xx)': (r) => r.status >= 400 && r.status < 500,
  });
}
