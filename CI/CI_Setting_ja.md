# CI 設定仕様書

このドキュメントは CI の設定フラグ、TRUE/FALSE 時の挙動、成果物と格納場所、デプロイ処理の内容をまとめた仕様です。

**対象範囲**
- `.gitlab-ci.yml`
- `CI/ci-config/backend.yml`
- `CI/ci-config/frontend.yml`
- `CI/ci-config/deploy/backend.yml`
- `CI/ci-config/deploy/frontend.yml`
- `CI/ci-config/qa.yml`
- `CI/ci-config/common.yml`

**フロントエンド本体パスの前提**
- Frontend job の作業ディレクトリ、cache、artifact、deploy 入力は `FE/spa-next/my-next-app` を前提にしている
- FE 構成整理では、CI / Docker / 開発手順の参照更新と再検証をまとめた専用タスクを切らない限り、`FE/spa-next/my-next-app` は移設対象外とする

**グローバル変数（既定値）**
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

**デプロイブランチの集中管理**
デプロイ対象ブランチは `.gitlab-ci.yml` の `workflow: rules` で管理します。
- `CI_MERGE_REQUEST_TARGET_BRANCH_NAME` が `release_dev` / `release_uat` に一致する場合:
  - `BACKEND_DEPLOY='true'`
  - `FRONTEND_DEPLOY='true'`
- `CI_COMMIT_BRANCH` が `release_dev` / `release_uat` に一致する場合:
  - `BACKEND_DEPLOY='true'`
  - `FRONTEND_DEPLOY='true'`
- それ以外は `false` のまま

**フラグ別の挙動（TRUE / FALSE）**
- `BACKEND_ONLY`
  - `true`: フロントジョブは実行しない
  - `false`: フロントジョブは個別ルールに従い実行

- `FRONTEND_ONLY`
  - `true`: バックエンドジョブは実行しない
  - `false`: バックエンドジョブは個別ルールに従い実行

- `BACKEND_COVERAGE`
  - `true`: `backend-coverage` 実行（テスト + JaCoCo）
  - `false`: `backend-test` 実行（ユニットテストのみ）

- `BACKEND_DEP_SCAN`
  - `true`: MR / `develop` pipeline で `backend-dependency-scan` を手動実行できる
  - `false`: 依存関係スキャンはスキップ

- `BACKEND_ITEST`
  - `true`: `backend-test` / `backend-coverage` 内で結合テストを実行
  - `false`: 結合テストはスキップ

- `BACKEND_DEPLOY`
  - `true`: `backend-deploy` を手動実行できる
  - `false`: バックエンドのデプロイ job はスキップ

- `FRONTEND_LINT`
  - `true`: `frontend-lint` 実行
  - `false`: Lint はスキップ

- `FRONTEND_TEST`
  - `true`: `frontend-jest-test` 実行
  - `false`: Jest はスキップ

- `FRONTEND_COVERAGE`
  - `true`: `frontend-coverage` 実行
  - `false`: カバレッジ取得はスキップ

- `FRONTEND_STORYBOOK`
  - `true`: `frontend-storybook-build` 実行
  - `false`: Storybook build はスキップ

- `E2E_SMOKE`
  - `true`: `e2e-smoke` 実行対象にする
    - MR / branch pipeline では手動実行
    - schedule pipeline では自動実行
  - `false`: `e2e-smoke` はスキップ

- `PACT_VERIFY`
  - `true`: `pact-consumer-generate` / `pact-provider-verify` 実行対象にする
    - MR / branch pipeline では手動実行
    - schedule pipeline では自動実行
  - `false`: Pact 関連ジョブはスキップ

- `PACT_PUBLIC_SAMPLES`
  - `true`: `pact-public-samples-generate` / `pact-public-samples-provider-verify` 実行対象にする
    - MR / branch pipeline では手動実行
    - schedule pipeline では自動実行
  - `false`: 認証不要エンドポイント向けの Pact サンプルジョブはスキップ

- `TRIVY_SCAN`
  - `true`: `trivy-scan` 実行対象にする
    - MR / branch pipeline では手動実行
    - schedule pipeline では自動実行
  - `false`: `trivy-scan` はスキップ

- `GITLEAKS_SCAN`
  - `true`: `gitleaks-scan` 実行対象にする
    - MR / branch pipeline では手動実行
    - schedule pipeline では自動実行
  - `false`: `gitleaks-scan` はスキップ

- `K6_SMOKE`
  - `true`: `k6-smoke` 実行対象にする
    - MR / branch pipeline では手動実行
    - schedule pipeline では自動実行
  - `false`: `k6-smoke` はスキップ

- `ZAP_BASELINE`
  - `true`: `zap-baseline-scan` 実行対象にする
    - MR / branch pipeline では手動実行
    - schedule pipeline では自動実行
  - `false`: `zap-baseline-scan` はスキップ

- `FRONTEND_DEPLOY`
  - `true`: `frontend-deploy` を手動実行できる
  - `false`: デプロイはスキップ

**ジョブ概要と成果物**
- `backend-setup`
  - 目的: Maven リポジトリ準備・ローカル JAR 登録
  - 成果物: `.m2/repository`
  - 保持期限: 1時間

- `backend-dependency-scan`
  - 目的: OWASP dependency-check
  - 実行タイミング:
    - MR / `develop` pipeline: 手動
  - 成果物:
    - `BE/target/dependency-check-report.html`
    - `BE/target/dependency-check-report.xml`
    - `BE/target/dependency-check-report.json`
  - 保持期限: 10日

- `backend-test`
  - 目的: appserver ユニットテスト + 任意で結合テスト
  - 成果物:
    - `BE/appserver/target/surefire-reports`
    - `BE/batchserver/target/surefire-reports`
    - `BE/servercommon/target/surefire-reports`
  - GitLab test report:
    - `BE/appserver/target/surefire-reports/TEST-*.xml`
    - `BE/batchserver/target/surefire-reports/TEST-*.xml`
    - `BE/servercommon/target/surefire-reports/TEST-*.xml`
  - 保持期限: 10日

- `backend-coverage`
  - 目的: appserver/batchserver/servercommon のテスト + JaCoCo + 任意で結合テスト
  - 成果物:
    - `BE/appserver/target/site/jacoco`
    - `BE/batchserver/target/site/jacoco`
    - `BE/servercommon/target/site/jacoco`
    - `BE/appserver/target/surefire-reports`
    - `BE/batchserver/target/surefire-reports`
    - `BE/servercommon/target/surefire-reports`
  - GitLab test report:
    - `BE/appserver/target/surefire-reports/TEST-*.xml`
    - `BE/batchserver/target/surefire-reports/TEST-*.xml`
    - `BE/servercommon/target/surefire-reports/TEST-*.xml`
  - 保持期限: 10日

- `backend-build`
  - 目的: JAR ビルドと deploy 用成果物の作成
  - 成果物:
    - `BE/appserver/target/appserver-1.0.0-SNAPSHOT.jar`
    - `BE/batchserver/target/batchserver-1.0.0-SNAPSHOT.jar`
    - `BE/appserver/src/main/resources/*.yml`
    - `BE/batchserver/src/main/resources/*.yml`
  - 保持期限: 10日

- `backend-deploy`
  - 目的: バックエンド成果物デプロイ（有効時・手動実行）
  - 成果物: なし（ビルド成果物を使用）

- `frontend-install`
  - 目的: `npm ci`
  - 成果物: なし

- `frontend-lint`
  - 目的: Lint + TypeScript チェック
  - 成果物: なし

- `frontend-jest-test`
  - 目的: Jest テスト
  - 成果物: `FE/spa-next/my-next-app/scripts/jest-report.html`
  - 保持期限: 10日

- `frontend-coverage`
  - 目的: Jest カバレッジ
  - 成果物:
    - `FE/spa-next/my-next-app/scripts/jest-report.html`
    - `FE/spa-next/my-next-app/coverage`
  - GitLab coverage report:
    - `FE/spa-next/my-next-app/coverage/cobertura-coverage.xml`
  - 保持期限: 10日

- `frontend-storybook-build`
  - 目的: Storybook 静的ビルド
  - 成果物: `FE/spa-next/my-next-app/storybook-static`
  - 保持期限: 10日

- `e2e-smoke`
  - 目的: 外部検証環境 URL に対する Playwright smoke E2E
  - 前提:
    - `E2E_SMOKE=true`
    - `E2E_BASE_URL` に `https://...` 形式の接続先を設定
  - 成果物:
    - `FE/spa-next/my-next-app/playwright-report`
    - `FE/spa-next/my-next-app/src/tests/test-results`
  - 保持期限: 10日
  - 実行タイミング:
    - MR / branch pipeline: 手動
    - schedule pipeline: 自動

- `pact-consumer-generate`
  - 目的: Consumer シナリオから Pact 契約JSONを生成
  - 前提:
    - `PACT_VERIFY=true`
  - 成果物:
    - `CI/qa/pact/contracts/*.json`
  - 保持期限: 10日
  - 実行タイミング:
    - MR / branch pipeline: 手動
    - schedule pipeline: 自動

- `pact-provider-verify`
  - 目的: 生成済み Pact 契約を gateway provider 実装で検証
  - 前提:
    - `PACT_VERIFY=true`
    - `pact-consumer-generate` で生成済みの Pact JSON
    - 任意: `PACT_ENFORCE=true`（検証失敗時 fail）
  - 成果物:
    - `BE/gateway/target/surefire-reports`
  - GitLab test report:
    - `BE/gateway/target/surefire-reports/TEST-*.xml`
  - 保持期限: 10日
  - 実行タイミング:
    - MR / branch pipeline: 手動
    - schedule pipeline: 自動

- `pact-public-samples-generate`
  - 目的: appserver の認証不要エンドポイント向け Pact サンプルを生成し、allowlist とのドリフトを検知
  - 前提:
    - `PACT_PUBLIC_SAMPLES=true`
  - 成果物:
    - `CI/qa/pact/contracts-samples/*.json`
  - 保持期限: 10日
  - 実行タイミング:
    - MR / branch pipeline: 手動
    - schedule pipeline: 自動

- `pact-public-samples-provider-verify`
  - 目的: 認証不要エンドポイント向け Pact サンプルを appserver provider 実装で検証
  - 前提:
    - `PACT_PUBLIC_SAMPLES=true`
    - `pact-public-samples-generate` で生成済みの Pact JSON
    - 任意: `PACT_PUBLIC_SAMPLES_ENFORCE=true`（検証失敗時 fail）
  - 成果物:
    - `BE/appserver/target/surefire-reports`
  - GitLab test report:
    - `BE/appserver/target/surefire-reports/TEST-com.example.appserver.pact.AppserverPublicEndpointSamplesPactProviderVerificationTest.xml`
  - 保持期限: 10日
  - 実行タイミング:
    - MR / branch pipeline: 手動
    - schedule pipeline: 自動

- `trivy-scan`
  - 目的: Trivy によるファイルシステムスキャン（脆弱性 / 設定不備）
  - 前提:
    - `TRIVY_SCAN=true`
    - 任意: `TRIVY_TARGET_DIR` / `TRIVY_SEVERITY` / `TRIVY_TIMEOUT`
    - 任意: `TRIVY_ENFORCE=true`（検出時 fail）
  - 成果物:
    - `dist/security/trivy-fs.json`
  - 保持期限: 10日
  - 実行タイミング:
    - MR / branch pipeline: 手動
    - schedule pipeline: 自動

- `gitleaks-scan`
  - 目的: Gitleaks によるシークレットスキャン
  - 前提:
    - `GITLEAKS_SCAN=true`
    - 任意: `GITLEAKS_ENFORCE=true`（検出時 fail）
  - 成果物:
    - `dist/security/gitleaks.sarif`
  - 保持期限: 10日
  - 実行タイミング:
    - MR / branch pipeline: 手動
    - schedule pipeline: 自動

- `k6-smoke`
  - 目的: 外部検証環境 URL に対する k6 smoke 負荷テスト
  - 前提:
    - `K6_SMOKE=true`
    - `K6_TARGET_URL` に接続先 URL を設定
  - 成果物:
    - `dist/k6/summary.json`
  - 保持期限: 10日
  - 実行タイミング:
    - MR / branch pipeline: 手動
    - schedule pipeline: 自動

- `zap-baseline-scan`
  - 目的: 外部検証環境 URL に対する OWASP ZAP baseline scan
  - 前提:
    - `ZAP_BASELINE=true`
    - `ZAP_TARGET_URL` に接続先 URL を設定
  - 成果物:
    - `dist/zap/report.json`
    - `dist/zap/report.html`
    - `dist/zap/report.md`
  - 保持期限: 10日
  - 実行タイミング:
    - MR / branch pipeline: 手動
    - schedule pipeline: 自動

- `frontend-build`
  - 目的: Next.js ビルド
  - 成果物: `FE/spa-next/my-next-app/out`
  - 保持期限: 1時間

- `frontend-deploy`
  - 目的: フロント成果物デプロイ（有効時・手動実行）
  - 成果物: なし（ビルド成果物を使用）

**成果物の格納場所**
成果物は GitLab CI の job artifacts に保存されます。
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

**デプロイ処理の詳細**
- Backend（`backend-deploy` を手動実行し、`BACKEND_DEPLOY=true` の場合）
  - 一時鍵 `$CI_PROJECT_DIR/tmp_ssh_key.pem` を作成
  - `openssh-client` インストール
  - `ec2-user@172.17.0.1` へ SSH 接続確認
  - JAR を以下へコピー:
    - `/home/app/gitlab-runner/backend/appserver/`
    - `/home/app/gitlab-runner/backend/batchserver/`
  - `resources/*.yml` を以下へコピー:
    - `/home/app/gitlab-runner/backend/appserver/`
    - `/home/app/gitlab-runner/backend/batchserver/`
  - `/home/app/gitlab-runner/restart_services.sh` を実行
  - 一時鍵を削除

- Frontend（`frontend-deploy` を手動実行し、`FRONTEND_DEPLOY=true` の場合）
  - `openssh-client` / `rsync` をインストール
  - 一時鍵 `$CI_PROJECT_DIR/tmp_ssh_key.pem` を作成
  - `ec2-user@172.17.0.1` へ SSH 接続確認
  - `.env*` を以下へコピー:
    - ローカル `/home/app/gitlab-runner/frontend/`
    - リモート `/home/app/gitlab-runner/frontend/`
  - ビルド成果物 `out/` を以下へ rsync:
    - `/home/app/gitlab-runner/frontend/`
  - 一時鍵を削除
