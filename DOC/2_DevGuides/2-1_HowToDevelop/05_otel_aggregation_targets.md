# OTel 集計対象一覧と導線整備計画

## 1. 目的

- 現在の OpenTelemetry 集計対象（どのサービスを観測しているか）を明確化する。
- 現在未対応のサービスを feature 単位で管理し、導線整備を段階実装できるようにする。

## 2. 現在の集計導線（modern）

```text
backend(appserver), gateway(apigateway)
  -> OTLP HTTP (:4318)
  -> otel-collector
     -> metrics: influxdb + prometheus endpoint(:9464) + debug
     -> traces: debug
     -> logs: debug
```

注記:

- metrics の永続化先は InfluxDB（`ci_metrics`）。
- traces / logs は現時点では debug exporter のみ（恒久保存先は未導入）。

## 3. 現在の集計対象一覧

| ID | サービス | family | 信号 | 収集経路 | 状態 |
|---|---|---|---|---|---|
| CUR-01 | `backend`（appserver） | modern | traces, metrics | OTLP -> collector | 稼働中 |
| CUR-02 | `gateway`（apigateway） | modern | traces, metrics | OTLP -> collector | 稼働中 |
| CUR-03 | `batchserver` | modern | traces, metrics | OTLP -> collector | 稼働中 |
| CUR-04 | `syncconnector` | modern | traces, metrics | OTLP -> collector | `syncconnector` profile 時に稼働 |
| CUR-05 | `mysql` | modern | infra metrics | mysqld-exporter -> prometheus receiver -> collector | `monitoring` profile 時に稼働 |
| CUR-06 | `redis` | modern | infra metrics | redis-exporter -> prometheus receiver -> collector | `monitoring` profile 時に稼働 |
| CUR-07 | `minio` | modern | infra metrics | MinIO Prometheus metrics -> prometheus receiver -> collector | `monitoring` profile 時に稼働 |
| CUR-08 | `frontend` | modern | web-vitals, trace context | browser OTLP metrics + `traceparent` header | 稼働中 |
| CUR-09 | `otel-collector` | modern | collector自身のメトリクス | `otel-metrics` 取得 | 稼働中 |
| CUR-10 | `grafana` | modern | dashboards | InfluxDB datasource + provisioning dashboard | `monitoring` profile 時に稼働 |

補足:

- `wiremock` は exporter 経由の収集未実装（条件付き対象）。
- `frontend` は Web SDK での full RUM ではなく、現時点は Web Vitals OTLP 送信 + trace context 伝播の最小構成。

### 3.1 modern サービス棚卸し（集計判定）

| サービス | 主用途 | 集計判定 | 理由 |
|---|---|---|---|
| `backend` | API 本体（appserver） | 対象（導入済み） | 主要API処理の中核 |
| `gateway` | API入口（apigateway） | 対象（導入済み） | リクエスト入口の遅延/エラー把握に必須 |
| `batchserver` | バッチ処理 | 対象（導入済み） | 非同期処理障害の可視化が必要 |
| `syncconnector` | 同期連携 | 対象（導入済み） | 外部連携経路の遅延/失敗追跡が必要 |
| `frontend` | UI 開発サーバ | 対象（導入済み） | UX劣化とAPI遅延の相関分析 |
| `frontend-static` | 配信用静的配信 | 条件付き | Webサーバ指標を取る場合のみ |
| `mysql` | DB | 対象（導入済み） | 接続/遅延/負荷の基盤監視が必要 |
| `redis` | キャッシュ | 対象（導入済み） | キャッシュヒット/メモリ圧迫監視が必要 |
| `minio` | オブジェクトストレージ | 対象（導入済み） | I/O・エラー傾向の監視が必要 |
| `wiremock` | 外部APIスタブ | 条件付き | 外部API置換検証時のみ有効 |
| `e2e` / `newman` / `k6` | テストランナー | 非対象（標準） | 実行結果はレポート系で管理するため |
| `trivy` / `gitleaks` / `zap-baseline` | セキュリティ検査 | 非対象（標準） | 監視ではなく検査結果管理が主目的 |

## 4. 追加 feature（推奨）

| Feature ID | 対象 | 優先度 | 追加する信号 | 目的 | 状態 |
|---|---|---|---|---|---|
| FEAT-OTEL-01 | `batchserver` | High | traces, metrics | バッチ処理失敗/遅延の可視化 | 完了（2026-04-10） |
| FEAT-OTEL-02 | `syncconnector` | High | traces, metrics | 同期経路の遅延・失敗追跡 | 完了（2026-04-10） |
| FEAT-OTEL-03 | `mysql` / `redis` / `minio` | High | metrics | 依存基盤のボトルネック可視化 | 完了（2026-04-10） |
| FEAT-OTEL-04 | `frontend`（Next.js） | Medium | browser metrics, trace context | 画面体験と API 遅延の相関把握 | 完了（2026-04-10） |
| FEAT-OTEL-05 | `java-legacy`（`tomcat`, `apache`） | Medium | metrics, traces | legacy family の観測統一 | 部分完了（2026-04-11, metrics導線） |
| FEAT-OTEL-06 | csharp family（将来の実アプリ） | Medium | metrics, traces | family 横断の観測基準統一 | 未着手 |
| FEAT-OTEL-07 | logs 永続化 | Medium | logs | 障害調査時のログ追跡性向上 | 未着手 |
| FEAT-OTEL-08 | `grafana` | Medium | dashboards, alerting | OTel 指標の時系列可視化と運用導線標準化 | 部分完了（2026-04-11, modern 導入） |

## 5. 集計導線整備計画

### Phase 1（短期）

対象: `batchserver`, `syncconnector`（FEAT-OTEL-01, 02）

1. Spring 側に OTLP 設定（`management.tracing`, `management.otlp.metrics.export`）を追加
2. `docker/compose.yml` の各サービスへ OTEL 環境変数を追加
3. `docker/stack.sh otel-metrics` と collector ログで流入確認

受け入れ条件:

- `job="batchserver"` / `job="syncconnector"` を metrics 出力で確認できる
- collector に exporter エラーが継続発生しない
- 実装状況: 完了（2026-04-10）

### Phase 2（中期）

対象: `mysql`, `redis`, `minio`（FEAT-OTEL-03）

1. 各 exporter（`mysqld-exporter`, `redis-exporter`, MinIO metrics）を compose 追加
2. collector に `prometheus receiver` を追加し exporter を scrape
3. InfluxDB の measurement と `otel-metrics` 出力で確認

受け入れ条件:

- DB/Cache/ObjectStorage の主要指標（接続数、エラー、レイテンシ等）を取得できる
- 実装状況: 完了（2026-04-10）

### Phase 3（中期）

対象: `frontend`, `java-legacy`, csharp family（FEAT-OTEL-04, 05, 06）

1. frontend に Web 計測導線（Web Vitals + trace context 伝播）を追加
2. java-legacy は Java `1.8.0_202` + Tomcat `6.0.43` 前提で最小計測（アクセス/エラー/遅延）を導入
3. csharp family は「SDK コンテナ」ではなく「実アプリコンテナ」へ計測導線を設計

受け入れ条件:

- family ごとの主要経路（画面 -> gateway -> app）が単一トレース観点で追跡可能
- 実装状況:
  - `FEAT-OTEL-04`（frontend）は完了（2026-04-10）
  - `FEAT-OTEL-05` は metrics 導線を実装完了（`java-legacy` collector + apache/httpcheck receiver）
  - `FEAT-OTEL-05` の traces は未着手（Java Agent 方式などの設計判断が必要）
  - `FEAT-OTEL-06` は未着手

### Phase 4（中長期）

対象: logs / dashboards 可視化（FEAT-OTEL-07, 08）

1. logs の保存先（例: Loki）を決定
2. collector の logs pipeline を恒久保存先へ接続
3. `monitoring` プロファイルに Grafana を追加し、InfluxDB datasource を provisioning
4. 主要ダッシュボード（gateway/appserver/mysql/redis/minio）を標準配備
5. 障害調査手順を運用ドキュメント化

受け入れ条件:

- traces / metrics / logs を同一時系列で参照できる
- Grafana の初期ダッシュボードで主要サービスの傾向を即時確認できる
- 実装状況:
  - `FEAT-OTEL-08` は modern family に導入完了（Grafana service + InfluxDB datasource provisioning + 初期ダッシュボード）
  - `FEAT-OTEL-08` の family 横断展開（java-legacy/csharp）は未着手

## 6. 判断が必要な項目

- traces/logs の恒久可視化先（Loki/Grafana など）
- Grafana の適用範囲（`modern` 先行 or family 横断同時展開）
- frontend 観測の粒度（最小構成か詳細RUMか）
- java-legacy / csharp をどこまで共通基準へ揃えるか
