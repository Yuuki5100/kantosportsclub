# k6-tests 移植可否の分類

本ファイルは `CI/qa/k6/k6-tests` 配下のテストコードについて、**PJ独自の実装に依存するもの**と**依存しないもの**を切り分けて一覧化したものです。

---

## PJの実装に依存しないテスト（保持対象）

- `CI/qa/k6/k6-tests/CT1505_TIMEOUT.js` (CT1505)
- `CI/qa/k6/k6-tests/CT1201_EXCEPTION_HANDLING.js` (CT1201)
- `CI/qa/k6/k6-tests/CT1105_IDEMPOTENCY.js` (CT1105)
- `CI/qa/k6/k6-tests/CT1103_AUTH_GET_LIST.js` (CT1103)
- `CI/qa/k6/k6-tests/CT1502_UPLOAD_CONTENT_TYPE.js` (CT1502)
- `CI/qa/k6/k6-tests/CT1801_CORS_CONFIG.js` (CT1801)
- `CI/qa/k6/k6-tests/CT1701_AUTH_JSON_LOAD.js` (CT1701)
- `CI/qa/k6/k6-tests/auth_helper.js`

---

## PJの実装に依存するテスト（移行先では削除対象）

- `CI/qa/k6/k6-tests/react2shell/`
- `CI/qa/k6/k6-tests/sc04/`
- `CI/qa/k6/k6-tests/sc05/`
- `CI/qa/k6/k6-tests/sc06/`
- `CI/qa/k6/k6-tests/sc07/`
- `CI/qa/k6/k6-tests/sc09/`
- `CI/qa/k6/k6-tests/Dump20251202.sql`
- `CI/qa/k6/k6-tests/Dump20251215.sql`
- `CI/qa/k6/k6-tests/env.js`
- `CI/qa/k6/k6-tests/login.js`
- `CI/qa/k6/k6-tests/PRD_TEST_EXECUTION_GUIDE.md`
- `CI/qa/k6/k6-tests/run-test.sh`
- `CI/qa/k6/k6-tests/sc02-01.md`
- `CI/qa/k6/k6-tests/sc02-02-エビデンス.xlsx`
- `CI/qa/k6/k6-tests/sc02-02.md`
- `CI/qa/k6/k6-tests/sc02-15.md`
- `CI/qa/k6/k6-tests/sc02-18.md`
- `CI/qa/k6/k6-tests/sc02_01.js`
- `CI/qa/k6/k6-tests/sc02_02.js`
- `CI/qa/k6/k6-tests/sc02_15.js`
- `CI/qa/k6/k6-tests/sc02_18.js`
- `CI/qa/k6/k6-tests/sc04_01_b_stocklist.md`
- `CI/qa/k6/k6-tests/SC06_TEST_EXECUTION_GUIDE.md`
- `CI/qa/k6/k6-tests/SESSION_HANDOVER.md`
- `CI/qa/k6/k6-tests/slo.js`
- `CI/qa/k6/k6-tests/sogyokanri_20251201.sql`
- `CI/qa/k6/k6-tests/test.js`
- `CI/qa/k6/k6-tests/TEST_IMPLEMENTATION_GUIDE.md`
- `CI/qa/k6/k6-tests/USER_MANAGEMENT_ARCHITECTURE.md`

---

## 判断理由（共通）

- エンドポイント/パス/DB/ユーザー/運用手順が現PJの仕様に依存
- 環境URLや認証方式、画面やデータ構造が移行先で変わる前提
