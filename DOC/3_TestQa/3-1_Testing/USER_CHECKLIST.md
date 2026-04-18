# ユーザーチェックリスト（移行・運用前）

以下は、移行・運用開始前にユーザー確認が必要な観点のチェックリストです。

1. 運用対象環境（`dev / uat / prd` のどこで運用するか）
2. 認証方式とログインAPI（`LOGIN_PATH` やセッションCookie名）
3. k6 テスト対象APIのURL（`TARGET_URL` と `ENDPOINT_PATH`）
4. CORS検証対象エンドポイント（`CORS_ENDPOINT`）
5. ファイルアップロード検証の対象（`UPLOAD_PATH` と `FORM_FIELD`）
6. 監視スタック配置先（サーバIP/ドメイン、公開ポート）
7. CI Runnerから対象環境への到達性（VPN/Proxy/FW）
8. CIでの実行条件（MRのみ/Push/Schedule）
9. 非機能テストの閾値（`p95`/エラー率などの基準値）
10. テンプレの埋め方（空欄のまま移行 or 移行時に埋める）
