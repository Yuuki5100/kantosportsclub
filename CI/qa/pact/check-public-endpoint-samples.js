const fs = require('node:fs');
const path = require('node:path');

const allowlistPath = path.resolve(__dirname, '../../../BE/appserver/src/main/resources/config/allowlist.yml');
const contractPath = process.env.PACT_PUBLIC_SAMPLES_CONTRACT
  ? path.resolve(process.cwd(), process.env.PACT_PUBLIC_SAMPLES_CONTRACT)
  : path.resolve(__dirname, 'contracts-samples/frontend-consumer-public-endpoints-sample-appserver-provider.json');

const IGNORED_ALLOWLIST_PATHS = new Set([
  '/auth/login',
  '/auth/refresh',
  '/auth/external-login',
  '/auth/callback',
  '/api/auth/refresh',
  '/api/test/**',
  '/ws/**',
  '/favicon.ico',
  '/oauth/authorize',
  '/oauth/token',
  '/callback'
]);

function parseAllowlistPaths(yamlText) {
  const paths = [];
  let inPathsBlock = false;

  for (const rawLine of yamlText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!inPathsBlock) {
      if (line === 'paths:') {
        inPathsBlock = true;
      }
      continue;
    }

    if (line.startsWith('- ')) {
      const value = line.slice(2).trim().replace(/^["']|["']$/g, '');
      if (value.length > 0) {
        paths.push(value);
      }
      continue;
    }

    if (line.length > 0 && !line.startsWith('#')) {
      break;
    }
  }

  return paths;
}

function matchesPattern(pathValue, pattern) {
  if (pattern.endsWith('/**')) {
    const prefix = pattern.slice(0, -3);
    return pathValue === prefix || pathValue.startsWith(`${prefix}/`);
  }
  return pathValue === pattern;
}

function main() {
  if (!fs.existsSync(allowlistPath)) {
    console.error(`[pact] allowlist not found: ${allowlistPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(contractPath)) {
    console.error(`[pact] sample contract not found: ${contractPath}`);
    console.error('[pact] Run: npm run pact:consumer:samples --prefix CI/qa/pact');
    process.exit(1);
  }

  const allowlistText = fs.readFileSync(allowlistPath, 'utf8');
  const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  const allowlistPaths = parseAllowlistPaths(allowlistText)
    .filter((entry) => !IGNORED_ALLOWLIST_PATHS.has(entry));

  const samplePaths = [...new Set(
    (contractJson.interactions || [])
      .map((it) => it?.request?.path)
      .filter((it) => typeof it === 'string' && it.length > 0)
  )];

  const missingInSamples = allowlistPaths
    .filter((pattern) => !samplePaths.some((pathValue) => matchesPattern(pathValue, pattern)));

  const extraInSamples = samplePaths
    .filter((pathValue) => !allowlistPaths.some((pattern) => matchesPattern(pathValue, pattern)));

  if (missingInSamples.length === 0 && extraInSamples.length === 0) {
    console.log('[pact] Public endpoint sample drift check passed');
    console.log(`[pact] allowlist paths checked: ${allowlistPaths.length}`);
    console.log(`[pact] sample paths checked: ${samplePaths.length}`);
    return;
  }

  console.error('[pact] Public endpoint sample drift detected');
  if (missingInSamples.length > 0) {
    console.error('[pact] Missing in sample contract (allowlist -> samples):');
    for (const value of missingInSamples) {
      console.error(`  - ${value}`);
    }
  }
  if (extraInSamples.length > 0) {
    console.error('[pact] Extra in sample contract (samples -> allowlist):');
    for (const value of extraInSamples) {
      console.error(`  - ${value}`);
    }
  }
  process.exit(1);
}

main();
