# CI Setting Specification

This document summarizes CI configuration flags, their TRUE/FALSE behavior, produced artifacts, storage locations, and deploy actions.

**Scope**
- GitLab CI configuration files: `.gitlab-ci.yml`, `CI/ci-config/backend.yml`, `CI/ci-config/frontend.yml`, `CI/ci-config/deploy/backend.yml`, `CI/ci-config/deploy/frontend.yml`, `CI/ci-config/qa.yml`, `CI/ci-config/common.yml`

**Global Variables (Defaults)**
- `BACKEND_ONLY`: `true`
- `FRONTEND_ONLY`: `false`
- `BACKEND_COVERAGE`: `false`
- `BACKEND_DEP_SCAN`: `true`
- `BACKEND_ITEST`: `false`
- `BACKEND_DEPLOY`: `false`
- `FRONTEND_DEPLOY`: `false`
- `FRONTEND_LINT`: `false`
- `FRONTEND_TEST`: `false`
- `FRONTEND_COVERAGE`: `false`
- `FRONTEND_STORYBOOK`: `false`
- `E2E_SMOKE`: `false`
- `E2E_BASE_URL`: `""`
- `PACT_VERIFY`: `false`
- `PACT_ENFORCE`: `false`
- `PACT_PUBLIC_SAMPLES`: `false`
- `PACT_PUBLIC_SAMPLES_ENFORCE`: `false`
- `TRIVY_SCAN`: `false`
- `TRIVY_TARGET_DIR`: `.`
- `TRIVY_SEVERITY`: `HIGH,CRITICAL`
- `TRIVY_TIMEOUT`: `10m`
- `TRIVY_ENFORCE`: `false`
- `GITLEAKS_SCAN`: `false`
- `GITLEAKS_ENFORCE`: `false`
- `K6_SMOKE`: `false`
- `K6_TARGET_URL`: `""`
- `K6_VUS`: `10`
- `K6_DURATION`: `30s`
- `K6_EXPECTED_STATUSES`: `200,401,403,404`
- `ZAP_BASELINE`: `false`
- `ZAP_TARGET_URL`: `""`
- `ZAP_SPIDER_MINUTES`: `3`
- `MAVEN_OPTS`: `-Dmaven.repo.local=.m2/repository`

**Deploy Branch Control (Centralized)**
Deployment flags are centrally controlled in `.gitlab-ci.yml` using `workflow: rules`.
- If `CI_MERGE_REQUEST_TARGET_BRANCH_NAME` matches `release_dev` or `release_uat`, set:
  - `BACKEND_DEPLOY='true'`
  - `FRONTEND_DEPLOY='true'`
- If `CI_COMMIT_BRANCH` matches `release_dev` or `release_uat`, set the same.
- Otherwise, deploy flags remain `false`.

**Behavior by Flag (TRUE/FALSE)**
- `BACKEND_ONLY`
  - `true`: frontend jobs skip (`when: never`)
  - `false`: frontend jobs run if their own rules pass

- `FRONTEND_ONLY`
  - `true`: backend jobs skip (`when: never`)
  - `false`: backend jobs run if their own rules pass

- `BACKEND_COVERAGE`
  - `true`: `backend-coverage` runs (test + jacoco)
  - `false`: `backend-test` runs (unit test only)

- `BACKEND_DEP_SCAN`
  - `true`: `backend-dependency-scan` is shown as a manual job in MR / `develop` pipelines
  - `false`: dependency scan job is skipped

- `BACKEND_ITEST`
  - `true`: integration tests run in `backend-test` or `backend-coverage`
  - `false`: integration tests are skipped

- `BACKEND_DEPLOY`
  - `true`: `backend-deploy` becomes runnable as a manual job
  - `false`: backend deploy job is skipped

- `FRONTEND_LINT`
  - `true`: `frontend-lint` runs
  - `false`: lint job is skipped

- `FRONTEND_TEST`
  - `true`: `frontend-jest-test` runs
  - `false`: jest job is skipped

- `FRONTEND_COVERAGE`
  - `true`: `frontend-coverage` runs
  - `false`: coverage job is skipped

- `FRONTEND_STORYBOOK`
  - `true`: `frontend-storybook-build` runs
  - `false`: Storybook build job is skipped

- `E2E_SMOKE`
  - `true`: `e2e-smoke` becomes runnable
    - manual in MR / branch pipelines
    - automatic in schedule pipelines
  - `false`: `e2e-smoke` is skipped

- `PACT_VERIFY`
  - `true`: `pact-consumer-generate` / `pact-provider-verify` become runnable
    - manual in MR / branch pipelines
    - automatic in schedule pipelines
  - `false`: Pact jobs are skipped

- `PACT_PUBLIC_SAMPLES`
  - `true`: `pact-public-samples-generate` / `pact-public-samples-provider-verify` become runnable
    - manual in MR / branch pipelines
    - automatic in schedule pipelines
  - `false`: public endpoint sample Pact jobs are skipped

- `TRIVY_SCAN`
  - `true`: `trivy-scan` becomes runnable
    - manual in MR / branch pipelines
    - automatic in schedule pipelines
  - `false`: `trivy-scan` is skipped

- `GITLEAKS_SCAN`
  - `true`: `gitleaks-scan` becomes runnable
    - manual in MR / branch pipelines
    - automatic in schedule pipelines
  - `false`: `gitleaks-scan` is skipped

- `K6_SMOKE`
  - `true`: `k6-smoke` becomes runnable
    - manual in MR / branch pipelines
    - automatic in schedule pipelines
  - `false`: `k6-smoke` is skipped

- `ZAP_BASELINE`
  - `true`: `zap-baseline-scan` becomes runnable
    - manual in MR / branch pipelines
    - automatic in schedule pipelines
  - `false`: `zap-baseline-scan` is skipped

- `FRONTEND_DEPLOY`
  - `true`: `frontend-deploy` becomes runnable as a manual job
  - `false`: deploy job is skipped

**Job Summary and Artifacts**
- `backend-setup`
  - Purpose: setup Maven repo, install local JARs
  - Artifacts:
    - `.m2/repository`
  - Artifact retention: 1 hour

- `backend-dependency-scan`
  - Purpose: OWASP dependency-check
  - Run timing:
    - manual in MR / `develop` pipelines
  - Artifacts:
    - `BE/target/dependency-check-report.html`
    - `BE/target/dependency-check-report.xml`
    - `BE/target/dependency-check-report.json`
  - Artifact retention: 10 days

- `backend-test`
  - Purpose: unit tests for appserver, optional integration tests
  - Artifacts:
    - `BE/appserver/target/surefire-reports`
    - `BE/batchserver/target/surefire-reports`
    - `BE/servercommon/target/surefire-reports`
  - GitLab test reports:
    - `BE/appserver/target/surefire-reports/TEST-*.xml`
    - `BE/batchserver/target/surefire-reports/TEST-*.xml`
    - `BE/servercommon/target/surefire-reports/TEST-*.xml`
  - Artifact retention: 10 days

- `backend-coverage`
  - Purpose: test + jacoco for appserver/batchserver/servercommon, optional integration tests
  - Artifacts:
    - `BE/appserver/target/site/jacoco`
    - `BE/batchserver/target/site/jacoco`
    - `BE/servercommon/target/site/jacoco`
    - `BE/appserver/target/surefire-reports`
    - `BE/batchserver/target/surefire-reports`
    - `BE/servercommon/target/surefire-reports`
  - GitLab test reports:
    - `BE/appserver/target/surefire-reports/TEST-*.xml`
    - `BE/batchserver/target/surefire-reports/TEST-*.xml`
    - `BE/servercommon/target/surefire-reports/TEST-*.xml`
  - Artifact retention: 10 days

- `backend-build`
  - Purpose: package JARs and prepare deploy artifacts
  - Artifacts:
    - `BE/appserver/target/appserver-1.0.0-SNAPSHOT.jar`
    - `BE/batchserver/target/batchserver-1.0.0-SNAPSHOT.jar`
    - `BE/appserver/src/main/resources/*.yml`
    - `BE/batchserver/src/main/resources/*.yml`
  - Artifact retention: 10 days

- `backend-deploy`
  - Purpose: deploy built backend artifacts when enabled, via manual trigger
  - Artifacts: none (consumes build artifacts)

- `frontend-install`
  - Purpose: `npm ci`
  - Artifacts: none

- `frontend-lint`
  - Purpose: lint + TypeScript checks
  - Artifacts: none

- `frontend-jest-test`
  - Purpose: Jest unit tests
  - Artifacts:
    - `FE/spa-next/my-next-app/scripts/jest-report.html`
  - Artifact retention: 10 days

- `frontend-coverage`
  - Purpose: Jest coverage
  - Artifacts:
    - `FE/spa-next/my-next-app/scripts/jest-report.html`
    - `FE/spa-next/my-next-app/coverage`
  - GitLab coverage report:
    - `FE/spa-next/my-next-app/coverage/cobertura-coverage.xml`
  - Artifact retention: 10 days

- `frontend-storybook-build`
  - Purpose: build Storybook static assets
  - Artifacts:
    - `FE/spa-next/my-next-app/storybook-static`
  - Artifact retention: 10 days

- `e2e-smoke`
  - Purpose: Playwright smoke E2E against an external test URL
  - Prerequisites:
    - `E2E_SMOKE=true`
    - `E2E_BASE_URL` points to the target environment
  - Artifacts:
    - `FE/spa-next/my-next-app/playwright-report`
    - `FE/spa-next/my-next-app/src/tests/test-results`
  - Artifact retention: 10 days
  - Run timing:
    - manual in MR / branch pipelines
    - automatic in schedule pipelines

- `pact-consumer-generate`
  - Purpose: generate Pact contract JSON from consumer scenario
  - Prerequisites:
    - `PACT_VERIFY=true`
  - Artifacts:
    - `CI/qa/pact/contracts/*.json`
  - Artifact retention: 10 days
  - Run timing:
    - manual in MR / branch pipelines
    - automatic in schedule pipelines

- `pact-provider-verify`
  - Purpose: verify generated Pact contracts against gateway provider implementation
  - Prerequisites:
    - `PACT_VERIFY=true`
    - Pact JSON generated by `pact-consumer-generate`
    - Optional: `PACT_ENFORCE=true` for fail-on-verification-error behavior
  - Artifacts:
    - `BE/gateway/target/surefire-reports`
  - GitLab test reports:
    - `BE/gateway/target/surefire-reports/TEST-*.xml`
  - Artifact retention: 10 days
  - Run timing:
    - manual in MR / branch pipelines
    - automatic in schedule pipelines

- `pact-public-samples-generate`
  - Purpose: generate sample Pact contracts for no-auth appserver endpoints and run drift check against allowlist
  - Prerequisites:
    - `PACT_PUBLIC_SAMPLES=true`
  - Artifacts:
    - `CI/qa/pact/contracts-samples/*.json`
  - Artifact retention: 10 days
  - Run timing:
    - manual in MR / branch pipelines
    - automatic in schedule pipelines

- `pact-public-samples-provider-verify`
  - Purpose: verify generated public endpoint sample Pact contracts against appserver sample provider implementation
  - Prerequisites:
    - `PACT_PUBLIC_SAMPLES=true`
    - Pact JSON generated by `pact-public-samples-generate`
    - Optional: `PACT_PUBLIC_SAMPLES_ENFORCE=true` for fail-on-verification-error behavior
  - Artifacts:
    - `BE/appserver/target/surefire-reports`
  - GitLab test reports:
    - `BE/appserver/target/surefire-reports/TEST-com.example.appserver.pact.AppserverPublicEndpointSamplesPactProviderVerificationTest.xml`
  - Artifact retention: 10 days
  - Run timing:
    - manual in MR / branch pipelines
    - automatic in schedule pipelines

- `trivy-scan`
  - Purpose: Trivy filesystem scan (vulnerability + misconfiguration)
  - Prerequisites:
    - `TRIVY_SCAN=true`
    - Optional: `TRIVY_TARGET_DIR`, `TRIVY_SEVERITY`, `TRIVY_TIMEOUT`
    - Optional: `TRIVY_ENFORCE=true` for fail-on-findings behavior
  - Artifacts:
    - `dist/security/trivy-fs.json`
  - Artifact retention: 10 days
  - Run timing:
    - manual in MR / branch pipelines
    - automatic in schedule pipelines

- `gitleaks-scan`
  - Purpose: Gitleaks repository secret scan
  - Prerequisites:
    - `GITLEAKS_SCAN=true`
    - Optional: `GITLEAKS_ENFORCE=true` for fail-on-findings behavior
  - Artifacts:
    - `dist/security/gitleaks.sarif`
  - Artifact retention: 10 days
  - Run timing:
    - manual in MR / branch pipelines
    - automatic in schedule pipelines

- `k6-smoke`
  - Purpose: k6 smoke load test against an external test URL
  - Prerequisites:
    - `K6_SMOKE=true`
    - `K6_TARGET_URL` points to the target endpoint
  - Artifacts:
    - `dist/k6/summary.json`
  - Artifact retention: 10 days
  - Run timing:
    - manual in MR / branch pipelines
    - automatic in schedule pipelines

- `zap-baseline-scan`
  - Purpose: OWASP ZAP baseline scan against an external test URL
  - Prerequisites:
    - `ZAP_BASELINE=true`
    - `ZAP_TARGET_URL` points to the target environment
  - Artifacts:
    - `dist/zap/report.json`
    - `dist/zap/report.html`
    - `dist/zap/report.md`
  - Artifact retention: 10 days
  - Run timing:
    - manual in MR / branch pipelines
    - automatic in schedule pipelines

- `frontend-build`
  - Purpose: build Next.js output
  - Artifacts:
    - `FE/spa-next/my-next-app/out`
  - Artifact retention: 1 hour

- `frontend-deploy`
  - Purpose: deploy built frontend artifacts when enabled, via manual trigger
  - Artifacts: none (consumes build artifacts)

**Artifact Storage Locations**
All artifacts are stored in GitLab CI job artifacts. Key paths:
- Backend:
  - `.m2/repository`
  - `BE/target/dependency-check-report.*`
  - `BE/**/target/surefire-reports`
  - `BE/**/target/site/jacoco`
- Frontend:
  - `FE/spa-next/my-next-app/out`
  - `FE/spa-next/my-next-app/scripts/jest-report.html`
  - `FE/spa-next/my-next-app/coverage`
  - `FE/spa-next/my-next-app/storybook-static`
- Backend deploy input:
  - `BE/appserver/target/appserver-1.0.0-SNAPSHOT.jar`
  - `BE/batchserver/target/batchserver-1.0.0-SNAPSHOT.jar`
  - `BE/appserver/src/main/resources/*.yml`
  - `BE/batchserver/src/main/resources/*.yml`
- QA:
  - `FE/spa-next/my-next-app/playwright-report`
  - `FE/spa-next/my-next-app/src/tests/test-results`
  - `CI/qa/pact/contracts/*.json`
  - `BE/gateway/target/surefire-reports`
  - `dist/security/trivy-fs.json`
  - `dist/security/gitleaks.sarif`
  - `dist/k6/summary.json`
  - `dist/zap/report.json`
  - `dist/zap/report.html`
  - `dist/zap/report.md`

**Deploy Actions**
- Backend deploy (in manual `backend-deploy` when `BACKEND_DEPLOY=true`)
  - Creates temporary SSH key at `$CI_PROJECT_DIR/tmp_ssh_key.pem`
  - Installs `openssh-client`
  - SSH connectivity test to `ec2-user@172.17.0.1`
  - Copies JARs to:
    - `/home/app/gitlab-runner/backend/appserver/`
    - `/home/app/gitlab-runner/backend/batchserver/`
  - Copies resource `*.yml` files to:
    - `/home/app/gitlab-runner/backend/appserver/`
    - `/home/app/gitlab-runner/backend/batchserver/`
  - Runs `/home/app/gitlab-runner/restart_services.sh`
  - Removes temporary SSH key

- Frontend deploy (in manual `frontend-deploy` when `FRONTEND_DEPLOY=true`)
  - Installs `openssh-client` and `rsync`
  - Creates temporary SSH key at `$CI_PROJECT_DIR/tmp_ssh_key.pem`
  - SSH connectivity test to `ec2-user@172.17.0.1`
  - Copies `.env*` files from `FE/spa-next/my-next-app/` to:
    - local `/home/app/gitlab-runner/frontend/`
    - remote `/home/app/gitlab-runner/frontend/`
  - Syncs build artifacts (`out/`) to:
    - `/home/app/gitlab-runner/frontend/`
  - Removes temporary SSH key
