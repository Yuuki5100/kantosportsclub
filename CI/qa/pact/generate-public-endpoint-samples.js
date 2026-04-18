const fs = require('node:fs');
const path = require('node:path');

const { PactV3 } = require('@pact-foundation/pact');

const pactDir = path.resolve(__dirname, 'contracts-samples');
const pactFile = path.join(
  pactDir,
  'frontend-consumer-public-endpoints-sample-appserver-provider.json'
);

// Source of the public (no-auth) endpoint candidates:
// - BE/appserver/src/main/resources/config/allowlist.yml
// - BE/appserver controllers currently mapped in main sources
const PUBLIC_ENDPOINT_SAMPLES = [
  {
    id: 'auth-login',
    method: 'POST',
    path: '/api/auth/login',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { user_id: 'sample-user', password: 'sample-password' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { message: 'sample-login-success' }
    }
  },
  {
    id: 'auth-external-login',
    method: 'GET',
    path: '/api/auth/external-login',
    response: {
      status: 302,
      headers: { Location: 'https://example.local/oauth/authorize' }
    }
  },
  {
    id: 'auth-callback',
    method: 'GET',
    path: '/api/auth/callback',
    query: { code: 'sample-code', state: 'sample-state' },
    response: {
      status: 302,
      headers: { Location: 'http://localhost:3000/login' }
    }
  },
  {
    id: 'user-forgot-password',
    method: 'POST',
    path: '/api/user/forgot-password',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'sample@example.com' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { message: 'sample-forgot-password-accepted' }
    }
  },
  {
    id: 'user-reset-password',
    method: 'PUT',
    path: '/api/user/reset-password/sample-reset-token',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { newPassword: 'SamplePassword!123' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { message: 'sample-reset-password-success' }
    }
  },
  {
    id: 'batch-runner-start',
    method: 'POST',
    path: '/batch-runner/start',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { jobName: 'sample-job' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { accepted: true }
    }
  },
  {
    id: 'batch-runner-dummy',
    method: 'POST',
    path: '/batch-runner/dummy',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { message: 'sample' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { ok: true }
    }
  },
  {
    id: 'import-template-get',
    method: 'POST',
    path: '/import/templateGet',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { target: 'sample' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { template: 'sample-template' }
    }
  },
  {
    id: 'import-history',
    method: 'GET',
    path: '/import/history',
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: []
    }
  },
  {
    id: 'import-upload',
    method: 'POST',
    path: '/import/upload',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { fileName: 'sample.csv' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { uploaded: true }
    }
  },
  {
    id: 'import-download-ready',
    method: 'POST',
    path: '/import/downloadReady',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { jobId: 'sample-job-id' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { ready: true }
    }
  },
  {
    id: 'import-download',
    method: 'POST',
    path: '/import/download',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { jobId: 'sample-job-id' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/octet-stream' },
      body: 'sample-binary'
    }
  },
  {
    id: 'report-list',
    method: 'GET',
    path: '/report/list',
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: []
    }
  },
  {
    id: 'report-export-file',
    method: 'POST',
    path: '/report/export/csv/file',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { reportId: 'sample-report' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/octet-stream' },
      body: 'sample-export-file'
    }
  },
  {
    id: 'report-job',
    method: 'POST',
    path: '/report/job',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { reportId: 'sample-report' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { jobName: 'sample-job-name' }
    }
  },
  {
    id: 'report-polling',
    method: 'GET',
    path: '/report/polling/sample-job-name',
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { status: 'COMPLETED' }
    }
  },
  {
    id: 'report-download',
    method: 'POST',
    path: '/report/download/csv',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { jobName: 'sample-job-name' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/octet-stream' },
      body: 'sample-report-data'
    }
  },
  {
    id: 'files-upload',
    method: 'POST',
    path: '/api/files/upload',
    request: {
      headers: { 'Content-Type': 'application/json' },
      body: { fileName: 'sample.bin' }
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { fileId: 'sample-file-id' }
    }
  },
  {
    id: 'files-download',
    method: 'GET',
    path: '/api/files/download',
    query: { fileId: 'sample-file-id' },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/octet-stream' },
      body: 'sample-file-data'
    }
  },
  {
    id: 'files-delete',
    method: 'DELETE',
    path: '/api/files/sample-file-id',
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { deleted: true }
    }
  },
  {
    id: 'actuator-health',
    method: 'GET',
    path: '/actuator/health',
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { status: 'UP' }
    }
  },
  {
    id: 'openapi-docs',
    method: 'GET',
    path: '/v3/api-docs',
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { openapi: '3.0.0' }
    }
  },
  {
    id: 'swagger-ui',
    method: 'GET',
    path: '/swagger-ui/index.html',
    response: {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: '<html><body>sample-swagger-ui</body></html>'
    }
  },
  {
    id: 'spring-error',
    method: 'GET',
    path: '/error',
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'sample-error-payload' }
    }
  }
];

function buildQueryString(query) {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    params.set(key, String(value));
  }
  const queryString = params.toString();
  return queryString.length > 0 ? `?${queryString}` : '';
}

function toFetchOptions(sample) {
  const headers = { ...(sample.request?.headers || {}) };
  const options = { method: sample.method, headers, redirect: 'manual' };
  if (sample.request && sample.request.body !== undefined) {
    const isJson = headers['Content-Type'] === 'application/json';
    options.body = isJson ? JSON.stringify(sample.request.body) : String(sample.request.body);
  }
  return options;
}

function extractContentType(headers = {}) {
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === 'content-type') {
      return String(value);
    }
  }
  return '';
}

function isBinaryResponse(sample) {
  const contentType = extractContentType(sample.response?.headers || {});
  return contentType.toLowerCase().includes('application/octet-stream');
}

function buildPactResponse(sample) {
  if (!isBinaryResponse(sample)) {
    return sample.response;
  }
  return {
    ...sample.response,
    body: Buffer.from(String(sample.response.body), 'utf8').toString('base64')
  };
}

async function generatePactSamples() {
  fs.mkdirSync(pactDir, { recursive: true });
  if (fs.existsSync(pactFile)) {
    fs.unlinkSync(pactFile);
  }

  const provider = new PactV3({
    consumer: 'frontend-consumer-public-endpoints-sample',
    provider: 'appserver-provider',
    dir: pactDir
  });

  for (const sample of PUBLIC_ENDPOINT_SAMPLES) {
    const requestConfig = {
      method: sample.method,
      path: sample.path
    };
    if (sample.query) {
      requestConfig.query = sample.query;
    }
    if (sample.request?.headers) {
      requestConfig.headers = sample.request.headers;
    }
    if (sample.request?.body !== undefined) {
      requestConfig.body = sample.request.body;
    }

    provider
      .given('public sample endpoints are available')
      .uponReceiving(`[sample] ${sample.method} ${sample.path}`)
      .withRequest(requestConfig)
      .willRespondWith(buildPactResponse(sample));
  }

  await provider.executeTest(async (mockServer) => {
    for (const sample of PUBLIC_ENDPOINT_SAMPLES) {
      const url = `${mockServer.url}${sample.path}${buildQueryString(sample.query)}`;
      const response = await fetch(url, toFetchOptions(sample));
      if (response.status !== sample.response.status) {
        throw new Error(
          `Expected ${sample.method} ${sample.path} to return ${sample.response.status}, ` +
          `but got ${response.status}`
        );
      }
    }
  });

  console.log(`[pact] Public endpoint sample contracts generated at: ${pactDir}`);
  console.log(`[pact] Sample interaction count: ${PUBLIC_ENDPOINT_SAMPLES.length}`);
}

generatePactSamples().catch((error) => {
  console.error('[pact] Public endpoint sample contract generation failed');
  console.error(error);
  process.exit(1);
});
