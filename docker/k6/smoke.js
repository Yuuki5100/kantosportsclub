import http from "k6/http";
import { check, sleep } from "k6";

const targetUrl = __ENV.TARGET_URL || "http://gateway:8888/";
const vus = Number(__ENV.K6_VUS || 10);
const duration = __ENV.K6_DURATION || "30s";
const expectedStatuses = new Set(
  (__ENV.EXPECTED_STATUSES || "200,401,403,404")
    .split(",")
    .map((status) => Number(status.trim()))
    .filter((status) => !Number.isNaN(status)),
);
const responseCallback = http.expectedStatuses(...expectedStatuses);

export const options = {
  vus,
  duration,
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1500"],
    checks: ["rate>0.95"],
  },
};

export default function () {
  const response = http.get(targetUrl, {
    responseCallback,
    headers: {
      Accept: "text/html,application/json",
    },
    tags: {
      scenario: "smoke",
    },
  });

  check(response, {
    "status is expected": (res) => expectedStatuses.has(res.status),
    "response time under 1500ms": (res) => res.timings.duration < 1500,
  });

  sleep(1);
}
