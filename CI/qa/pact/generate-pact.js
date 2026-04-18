const fs = require('node:fs');
const path = require('node:path');

const { PactV3 } = require('@pact-foundation/pact');

const pactDir = path.resolve(__dirname, 'contracts');

async function generatePact() {
  fs.mkdirSync(pactDir, { recursive: true });

  const provider = new PactV3({
    consumer: 'frontend-consumer',
    provider: 'gateway-provider',
    dir: pactDir
  });

  provider
    .given('cors endpoint is available')
    .uponReceiving('a GET request to /test-cors')
    .withRequest({
      method: 'GET',
      path: '/test-cors'
    })
    .willRespondWith({
      status: 200,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body: 'CORS OK'
    });

  await provider.executeTest(async (mockServer) => {
    const response = await fetch(`${mockServer.url}/test-cors`);
    const responseBody = await response.text();

    if (response.status !== 200) {
      throw new Error(`Expected HTTP 200 but received ${response.status}`);
    }

    if (responseBody !== 'CORS OK') {
      throw new Error(`Expected response body "CORS OK" but received "${responseBody}"`);
    }
  });

  console.log(`[pact] Contract generated at: ${pactDir}`);
}

generatePact().catch((error) => {
  console.error('[pact] Contract generation failed');
  console.error(error);
  process.exit(1);
});
