# 環境変数の設定 バックエンド編（Spring Boot）

## 1. 目的
環境差分を設定値で吸収し、機能ON/OFFや外部連携有無をコード変更なしで切り替える。

## 2. 適用範囲
- appserver / batchserver / gateway の `application*.yml`
- 機密情報（JWT, DB, 外部連携秘密鍵）
- 非同期ジョブ・sync送信・認可基盤の有効/無効切替

## 3. 今回実装で追加・更新した設定

### 3-1. 非同期ジョブ永続化（appserver）

| key | 既定値 | 説明 |
| --- | --- | --- |
| `async.job.status-ttl-minutes` | `60` | ジョブ状態保持期限（分） |
| `async.job.cleanup-fixed-delay-ms` | `600000` | 期限切れ掃除の実行間隔（ms） |
| `async.job.cleanup-batch-size` | `100` | 1回の掃除件数 |
| `async.job.artifact-prefix` | `async-jobs` | 成果物の保存プレフィックス |

### 3-2. sync送信機能トグル

| key | 既定値 | 説明 |
| --- | --- | --- |
| `sync.outbox.use` | `false` | 送信基盤の有効/無効。`false` なら送信機能を使わない |
| `sync.outbox.max-retry` | `10` | 再送上限 |
| `sync.outbox.fixed-delay-ms` | `60000` | 再送スキャン間隔 |
| `sync.outbox.dispatch-limit` | `100` | 1回の送信件数上限 |

運用ルール:
- `sync.outbox.use=false` のシステムは sync送信機能を無効化し、`sync-connector` を依存に含めない。
- `sync.outbox.use=true` のシステムのみ sync送信設定（`sync.remote.*`, `sync.signed-rest.*`）を必須とする。

### 3-3. notify再送制御（appserver）

| key | 既定値 | 説明 |
| --- | --- | --- |
| `notify.queue.scan.limit` | `100` | 1回のスキャン件数上限 |
| `notify.queue.scan.fixed-delay-ms` | `10000000` | スキャン実行間隔（ms） |
| `notify.queue.scan.max-retry` | `5` | 送信再試行上限 |
| `notify.queue.scan.backoff-initial-delay-ms` | `1000` | バックオフ初期待機（ms） |
| `notify.queue.scan.backoff-multiplier` | `2.0` | バックオフ倍率（指数） |
| `notify.queue.scan.backoff-max-delay-ms` | `60000` | バックオフ待機上限（ms） |

運用ルール:
- `notify.queue.scan.*` は必ず外出しし、コードに固定値を埋め込まない。
- 大量再送時は `limit` と `fixed-delay-ms` を同時調整し、DB負荷と通知遅延のバランスを取る。

### 3-4. 認可基盤統合（appserver）

| key | 既定値 | 説明 |
| --- | --- | --- |
| `security.authorization.legacy-interceptor-enabled` | `false` | 旧 `AuthorizationInterceptor` 経路の有効/無効 |
| `security.permission.legacy-endpoint-config-enabled` | `false` | 旧 in-memory `EndpointPermissionConfig` の有効/無効 |
| `security.permission.cache-refresh-fixed-delay-ms` | `600000` | `endpoint_authority_mapping` キャッシュ再読込間隔 |
| `security.permission.method-security-allow-if-unmapped` | `true` | Method Security補助経路で未定義エンドポイントを許可するか |
| `security.permission.method-security-default-method` | `GET` | Method SecurityでHTTPメソッド省略時の既定値 |

運用ルール:
- 標準経路は `@RequirePermission + RolePermissionChecker` とする。
- 旧経路（`AuthorizationInterceptor`, `EndpointPermissionConfig`）は移行/互換時のみ明示有効化する。
- 本番で Method Security の未定義許可を使わない運用にする場合は `method-security-allow-if-unmapped=false` を設定する。

## 4. サンプル

```yaml
security:
  authorization:
    legacy-interceptor-enabled: false
  permission:
    legacy-endpoint-config-enabled: false
    cache-refresh-fixed-delay-ms: 600000
    method-security-allow-if-unmapped: true
    method-security-default-method: GET

async:
  job:
    status-ttl-minutes: 60
    cleanup-fixed-delay-ms: 600000
    cleanup-batch-size: 100
    artifact-prefix: async-jobs

sync:
  outbox:
    use: false
    max-retry: 10
    fixed-delay-ms: 60000
    dispatch-limit: 100

notify:
  queue:
    scan:
      limit: 100
      fixed-delay-ms: 10000000
      max-retry: 5
      backoff-initial-delay-ms: 1000
      backoff-multiplier: 2.0
      backoff-max-delay-ms: 60000
```

## 5. 注意事項
- 状態永続化機能は `async.job.*` 未設定でも既定値で動作するが、本番環境は明示設定を推奨。
- `sync.outbox.use` の値とモジュール依存を一致させる（設定だけ有効で依存未導入は運用NG）。
- 通知再送は `notify.queue.scan.max-retry` と `backoff-*` を環境要件（即時性/負荷）に合わせて調整する。
- 認可基盤は `security.permission.*` をアプリ別に明示し、デフォルト任せにしない。
