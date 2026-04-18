import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: Number(__ENV.K6_VUS || 10),
  duration: __ENV.K6_DURATION || '30s',
};

export default function () {
  const baseUrl = __ENV.TARGET_URL;
  if (!baseUrl) {
    throw new Error('TARGET_URL is required');
  }

  const res = http.get(`${baseUrl}/api/login`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
