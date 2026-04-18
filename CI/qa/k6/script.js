export const options = {
  vus: Number(__ENV.K6_VUS || 10),
  duration: __ENV.K6_DURATION || '30s',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
};
import http from 'k6/http';
import { check } from 'k6';
export default function () {
  const url = __ENV.TARGET_URL;
  if (!url) {
    throw new Error('TARGET_URL is required');
  }
  const res = http.get(url);
  check(res, { 'status 200': r => r.status === 200 });
}
