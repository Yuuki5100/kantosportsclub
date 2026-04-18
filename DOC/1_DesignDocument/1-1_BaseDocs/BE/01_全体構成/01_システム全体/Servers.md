
# 🧭 サーバー構成と責務分担設計書

この設計書では、ファイル連携やバッチ処理、ユーザー認証認可、APIゲートウェイ、署名付き同期連携などの機能における各サーバーモジュールの **役割** と **責務** を整理し、システム全体の構造理解・保守性向上を目的とする。

---

## 1. 構成概要

```plaintext
myproject/
├── appserver/         # 認証認可、API連携、ファイル受付、中量バッチ処理（JobRunner）
├── batchserver/       # スケジューラ・定期実行・重量バッチ処理（Spring Batch予定）
├── gateway/           # 外部公開インターフェース、認証フィルター、IP制御、ルーティング
├── syncconnector/     # 署名付き同期連携、受信検証、外部システム接続（任意導入）
└── servercommon/      # 共通ロジック層（バリデーション、DTO、ストレージなど）
```

---

## 2. アーキテクチャ方針

| 観点         | 内容 |
|--------------|------|
| 責務分離     | 単一責任の原則に従い、API処理・バッチ処理・ゲートウェイを分離 |
| 再利用性     | バリデーション・ストレージ処理等は共通モジュールで提供 |
| 柔軟性       | ストレージ種別、ファイル種別、ジョブの拡張に容易に対応 |
| 安全性       | ゲートウェイでのIP制御・認証制御、アプリ側での詳細認可チェック |
| 連携保護     | 同期連携は `syncconnector` で HMAC 署名付与と受信検証を行う（未利用システムは無効化運用可） |

---

## 3. 各サーバーの責務

### ✅ `servercommon`（共通ロジック層）

| 分類         | 内容 |
|--------------|------|
| 📦 モデル     | `User`, `JobStatus`, `ErrorCode`, `UserRolePermission` など |
| ✅ バリデーション | ファイル行ごとのエラー検出、共通の `ValidationResult<T>` 管理 |
| 🧪 Dispatcher | `FileValidatorDispatcher` によるファイル種別による自動振り分け |
| 💾 ストレージ抽象化 | `StorageService`, `FileSaver` により S3/ローカル切り替え可能 |
| 🧠 ユーティリティ | `FileType`, `FileNameResolver`, `ErrorCodeService` 等 |
| 🌐 共通レスポンス | `ApiResponse<T>`, `GlobalExceptionHandler`, Teams通知あり |

---

### ✅ `appserver`（認証・API・中量バッチ担当）

| 分類           | 内容 |
|----------------|------|
| 🔐 認証処理     | `AuthController`, `SecurityConfig` によるログイン・ログアウト対応 |
| 🔐 認可処理     | `@PreAuthorize`, `CustomPermissionEvaluator` によるエンドポイント制御 |
| 📥 アップロード | `/import/upload` によるファイル受付、バリデーション、保存 |
| 🔄 中量ジョブ実行 | `FileImportRunner` による `@Async` 実行（UIトリガー） |
| 📜 履歴取得     | `/import/history` による `JobStatus` ページング取得 |
| 🔗 Sync送信    | `sync.outbox.use=true` 時に Outbox 登録・署名付き送信・再送を実行 |
| 🧭 特徴         | ユーザー向けインターフェースとして、**即時反映・中量処理**に対応 |

---

### ✅ `batchserver`（定期／重量バッチ処理専用）

| 分類           | 内容 |
|----------------|------|
| ⏰ スケジューラ | `FileImportScheduler` により inputディレクトリ監視／自動ジョブ実行 |
| ⚙️ 自動取り込み | 未処理ファイルの読み込み・検証・登録を `ImportJobExecutor` で実行 |
| 💾 保存処理     | S3 またはローカルへの保存処理を `StorageService` により抽象化 |
| 📌 今後の拡張   | `Spring Batch` 導入による大規模データ処理（再実行・並列・リトライ対応） |
| 🧭 特徴         | **UIトリガー不要・定期実行・高負荷処理向け**の処理基盤を提供 |

---

### ✅ `gatewayservice`（外部APIゲートウェイ）

| 分類           | 内容 |
|----------------|------|
| 🌍 APIルーティング | JavaConfig による `/internal/**` `/external/**` のルーティング制御 |
| 🔐 認証・認可     | JWT／セッション認証に対応、ログイン不要ページのスキップ設定 |
| 🛡 IP制御       | `IpWhitelistFilter` によるCIDR形式のホワイトリスト制御（YAML定義） |
| 🔁 リトライ制御   | GETリクエストに限り、Gateway内でリトライ処理を構成（POST等は除外） |
| 📄 ログ・監視    | `TraceLoggingFilter` によるTrace ID付与、JSONログ出力（logback） |
| 🧭 特徴         | **外部公開の入り口として、セキュリティ・安定性を担保する**中継層 |

---

### ✅ `syncconnector`（署名付き同期連携専用）

| 分類           | 内容 |
|----------------|------|
| 🔏 署名付与     | `SignedRestTemplate` により HMAC 署名付き HTTP POST を実行 |
| 🛂 受信検証     | `SyncSignatureVerificationInterceptor` により署名ヘッダとボディを検証 |
| 🧰 共通部品     | `HmacSigner` で署名生成・検証ロジックを統一 |
| ⚙️ 軽量構成     | DB / JPA / Flyway / Batch を除外した独立 Spring Boot 構成 |
| 🧭 特徴         | **外部システムとの同期連携を安全に行う**連携専用層 |

---

## 4. 責務比較まとめ

| 機能カテゴリ     | gatewayservice   | appserver        | batchserver       | syncconnector    | servercommon     |
|------------------|------------------|------------------|-------------------|------------------|------------------|
| 認証・セッション | ✅ JWT/セッション | ✅ セッション管理 | ❌                | ❌               | ❌               |
| 権限チェック     | ⭕ 基本認証あり   | ✅ カスタム実装   | ❌                | ❌               | 一部共通定義あり |
| ファイルアップロード | ❌             | ✅ Multipart対応   | ❌                | ❌               | ⭕ 保存処理あり   |
| ジョブ起動        | ❌               | ✅ @Async 実行    | ✅ 定期実行        | ❌               | ⭕ Executorあり   |
| ストレージ保存    | ❌               | ⭕ FileSaver使用   | ⭕ StorageService使用 | ❌            | ✅ 実装・抽象層   |
| 検証／保存ロジック | ❌               | ⭕ Validator呼出し | ⭕ Validator呼出し | ⭕ 署名検証      | ✅ Dispatcher提供 |
| 処理履歴         | ❌               | ✅ job_status更新 | ✅ job_status更新  | ❌               | ✅ エンティティ定義 |
| 大量処理         | ❌               | ⭕ 中量向け        | ✅ 大量向け（将来） | ❌              | ❌               |
| ルーティング制御   | ✅ JavaConfig管理 | ❌               | ❌                | ❌               | ❌               |
| IP制御            | ✅ CIDR対応       | ❌               | ❌                | ❌               | ❌               |
| 署名付き同期連携   | ❌               | ⭕ 機能フラグで任意 | ❌                | ✅               | ⭕ 例外/共通メッセージ |
| リトライ制御      | ✅ GETのみ対象     | ❌               | ❌                | ❌               | ❌               |

---

## 5. 注釈

- 各サーバーのエンドポイント保護とリクエスト集中管理のため、`gatewayservice` にてフィルタレイヤー（IP制御・認証・ルーティング）を設けている。
- ゲートウェイは**外部との接点**として、UIや外部APIからのリクエストを集約管理。
- 認可判定やファイル保存など、アプリケーションロジックは `appserver` / `batchserver` 側に委譲。
- `syncconnector` は業務 API 本体ではなく、外部システムとの同期連携を安全に行うための署名付き接続層として分離している。
- `appserver` は `sync.outbox.use` で送信基盤を有効/無効化でき、無効時は `syncconnector` を依存に持たない構成を許容する。

---

## 履歴
v1.2 syncconnector を追加
v1.1 gatewayを追加
