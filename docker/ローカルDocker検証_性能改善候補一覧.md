# ローカルDocker検証 性能改善候補一覧

## 目的
- `docker/stack.sh` でのローカル検証時に、作業中に遅かった箇所を優先順で整理する
- 改善効果の見込み、修正対象ファイル、注意点を明確にし、次の改善タスクへそのまま移せる状態にする

## 前提
- 効果予測は今回の実測傾向からの概算であり、マシンスペックや Docker キャッシュ状態で変動する
- まずはローカル開発体験の短縮を優先し、CI 側への反映は Runner 制約確認後に個別判断する

## 改善候補一覧

| 優先 | 対象 | 遅かった理由 | 改善案 | 効果予測 | 主な修正対象 | 注意点 |
|---|---|---|---|---|---|---|
| P1 | `zap-baseline` | 毎回 `frontend-zap` で `npm run build` しており、Next.js production build 待ちが長い | ZAP用のフロントビルド成果物を再利用する。例: `frontend-zap-build` と `frontend-zap-run` を分け、ソース/lockfile変更時だけ build する | 1回あたり **1〜3分短縮** | `docker/compose.yml`, `docker/stack.sh`, `frontend/Dockerfile` | キャッシュ再利用を強めすぎると、古いバンドルをスキャンする事故が起きるため、再ビルド条件を明示する |
| P2 | `zap-baseline` | ZAP spider が `-m 3` で最大3分探索し、軽い確認でも待ちが長い | ローカル用に短時間モードを追加する。例: `zap-smoke` は `ZAP_SPIDER_MINUTES=1`、レビュー前だけ `zap-baseline` をフル実行 | 軽量確認時 **1〜2分短縮** | `docker/stack.sh`, `docker/README.md` | 探索時間を短くすると検出範囲が狭くなるため、用途を smoke / baseline で分ける |
| P3 | `zap-baseline` | フロント確認が主目的でも backend/frontend image の build 判定が毎回走る | ZAP実行前提サービスを最小化し、必要なら `--no-build` 相当の高速パスを別コマンド化する | キャッシュヒット時でも **10〜30秒短縮**、キャッシュミス時はさらに大きい | `docker/stack.sh`, `docker/compose.yml` | `--no-build` 固定にするとコード変更が反映されないため、通常版と高速版を分ける |
| P4 | `test-be` | `appserver,gateway,batchserver,syncconnector` を毎回まとめて `test` しており、部分修正でも2〜3分かかる | モジュール指定付きの高速コマンドを追加する。例: `test-be-appserver`, `test-be-gateway`、または引数で `-pl` を受ける | 部分修正時 **1〜2分短縮** | `docker/stack.sh`, `docker/compose.yml`, `docker/README.md` | 結合影響を見落としやすくなるため、最後に現行 `test-be` の全体実行は残す |
| P5 | `test-fe` | 毎回 `npm run lint && npm run test:coverage` で、全Lint + 全Jest + coverage を必ず実行している | 開発中の高速パスを追加する。例: `test-fe-quick` は `jest --runInBand --changedSince` または coverage 無し、レビュー前だけ現行 `test-fe` | 開発中の反復で **20〜60秒短縮** | `docker/compose.yml`, `docker/stack.sh`, `FE/spa-next/my-next-app/package.json`, `docker/README.md` | changed-only は差分外の回帰を拾えないため、用途を限定する |
| P6 | `test-fe` | ESLint warning 131件とテスト中の `console.log/error` が多く、ログ量が大きい | 既知warningの棚卸しと削減、テストの意図的エラーログは `spyOn(console, ...)` で抑制する | ログ確認の体感改善、実行時間は **数秒〜十数秒短縮** | `FE/spa-next/my-next-app/src/**`, `FE/spa-next/my-next-app/.eslintrc*` | ログ抑制しすぎると本物の異常を見落とすため、テスト単位で限定する |
| P7 | `e2e` | `compose up --build` 経由で、既に stack 起動済みでも build 判定と healthcheck 待ちが入る | 既存 `frontend/backend` が healthy 前提の高速コマンドを追加する。例: `e2e-fast` は `compose run --rm e2e` を使う | stack起動済み時 **30〜90秒短縮** | `docker/stack.sh`, `docker/compose.yml`, `docker/README.md` | サービス未起動時に失敗しやすいので、`status` 確認とセットで案内する |
| P8 | Docker healthcheck | `backend/gateway/frontend` の `start_period` / `retries` が安全寄りで、短時間確認では待ちが長め | ローカル smoke 用に healthcheck 待ちを短くした profile を検討する。もしくは `e2e-fast` / `k6-fast` では既存healthy前提にする | ケースにより **10〜40秒短縮** | `docker/compose.yml`, `docker/stack.sh` | 起動直後の不安定さを拾いにくくなるため、通常起動の healthcheck は維持する |
| P9 | FE Docker build | `package*.json` 更新時に `npm ci` レイヤ再構築が入り、2分級で重い | 依存更新頻度が低い前提で `node_modules` volume 活用範囲を見直す。CI/本番用 image とローカル開発用 image を分ける | 依存変更がない反復では **数十秒短縮**、依存変更時は効果小 | `frontend/Dockerfile`, `docker/compose.yml` | `node_modules` の永続化は環境差分の温床になりやすいため、再現性とのトレードオフを明記する |
| P10 | `zap-baseline` の `10003` | Next.js patched 版でも ZAP/Retire.js 側の検出追随遅れらしき警告が残り、調査コストが発生 | `10003` は全体IGNOREせず、Next.js だけ条件付きで一時許容する運用ルールを文書化する。ZAP定義更新後に再評価する | 実行時間短縮ではなく、**調査・判断時間を削減** | `docker/zap/zap-baseline.conf`, `docker/README.md`, `docker/チーム開発環境・テスト自動化サービス選定.md` | 全 `10003` IGNORE は本物の脆弱JSも見逃すため避ける。ライブラリ名/バージョンを限定して扱う |

## 推奨する着手順
1. `P1` + `P2`: ZAP の待ち時間を先に削る
2. `P4` + `P5`: BE/FE の部分実行コマンドを追加し、開発中の反復を軽くする
3. `P7` + `P8`: 既存 stack を活かした E2E 高速パスを追加する
4. `P6` + `P10`: ログノイズと誤検知の運用コストを下げる
5. `P3` + `P9`: build/cache設計を整理し、再現性を崩さない範囲で高速化する

## 次アクション候補
- `zap-smoke` と `e2e-fast` の追加
- `test-be` / `test-fe` のモジュール・軽量実行モード追加
- ZAP `10003` の Next.js 限定許容ルールをドキュメント化
