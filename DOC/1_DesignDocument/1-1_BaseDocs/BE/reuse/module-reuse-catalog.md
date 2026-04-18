# module-reuse-catalog

## 目的
再利用判断で参照する主要モジュールの責務と適用条件を一覧化する。

## 1. 非同期ジョブ基盤

### AsyncJobStatusService
| 項目 | 内容 |
| --- | --- |
| 種別 | 共通部品 (`servercommon`) |
| 主責務 | `async_job_execution` の状態遷移管理 |
| 入力 | `jobName`, `jobType`, `expiresAt`, `artifactPath` 等 |
| 出力 | `AsyncJobExecution` |
| 副作用 | DB更新 |
| 再利用できるケース | 非同期状態を再起動後も参照したい機能 |
| 再利用できないケース | 一時処理で状態永続化が不要な軽量処理 |

### AsyncJobArtifactService
| 項目 | 内容 |
| --- | --- |
| 種別 | 共通部品 (`servercommon`) |
| 主責務 | 成果物の保存/再取得/削除 |
| 入力 | `artifactPath`, `InputStream` |
| 出力 | `InputStream`, `URL` |
| 副作用 | ストレージI/O |
| 再利用できるケース | downloadReady/download型の後続取得 |
| 再利用できないケース | 成果物を保持しない通知専用処理 |

### AsyncJobCleanupService
| 項目 | 内容 |
| --- | --- |
| 種別 | 共通部品 (`appserver`) |
| 主責務 | TTL切れジョブ掃除 |
| 副作用 | ストレージ削除 + 状態更新 |
| 再利用できるケース | 期限付き非同期成果物を運用する機能 |

## 2. 帳票出力関連

### ReportPollingRunner
| 項目 | 内容 |
| --- | --- |
| 種別 | 機能共通Runner |
| 主責務 | 非同期帳票生成、状態更新、通知 |
| 再利用ポイント | `run/runPDF/runCSV/runFileOutput` の統一経路 |

### ReportTypeJudge
| 項目 | 内容 |
| --- | --- |
| 種別 | 起動制御 |
| 主責務 | `exportTarget` 判定、`jobName` 採番、`PENDING` 登録 |

## 3. 外部連携（任意導入）

### SignedRestTemplate / HmacSigner / SyncSignatureVerificationInterceptor
| 項目 | 内容 |
| --- | --- |
| 種別 | 外部連携共通部品 |
| 利用条件 | `sync.outbox.use=true` |
| 再利用ルール | 直叩き禁止、署名付き送信/受信検証を共通化 |
| 任意導入 | `sync.outbox.use=false` のシステムでは未導入可 |

## 4. 通知再送基盤（notify_queue）

### NotifyQueuePublisher / NotifyQueuePublisherImpl
| 項目 | 内容 |
| --- | --- |
| 種別 | 共通部品 (`appserver`) |
| 主責務 | 通知キュー登録（`PENDING` 初期化） |
| 入力 | `eventType`, `refId` |
| 副作用 | `notify_queue` INSERT |
| 再利用できるケース | 送信失敗時の再送を保証したい通知 |

### NotifyQueueScanService
| 項目 | 内容 |
| --- | --- |
| 種別 | 共通部品 (`appserver`) |
| 主責務 | 送信対象抽出、送信実行、状態遷移更新 |
| 入力 | `notify.queue.scan.*` 設定 |
| 副作用 | `notify_queue` UPDATE、WebSocket送信 |
| 再利用できるケース | 上限/バックオフ/永久失敗を伴う通知運用 |

### WebSocketNotificationService
| 項目 | 内容 |
| --- | --- |
| 種別 | 共通部品 (`appserver`) |
| 主責務 | `/topic/notify/{eventType}` 送信 |
| 互換方針 | eventType未知値はWARNのみで送信継続 |

## 5. 動的設定解決基盤（system_setting）

### SystemSettingResolver / DatabaseSystemSettingResolver
| 項目 | 内容 |
| --- | --- |
| 種別 | 共通部品 (`servercommon`) |
| 主責務 | `system_setting` から設定値を型安全に取得 |
| 入力 | `setting key`, `target type` |
| 出力 | `Optional<T>` / `getOrDefault` |
| 副作用 | キャッシュ参照・必要時DB参照 |
| 再利用できるケース | 業務運用で変更される設定値を参照する機能 |
| 再利用できないケース | 環境ごと固定の接続情報・秘密情報 |

### SystemSettingCache
| 項目 | 内容 |
| --- | --- |
| 種別 | 共通部品 (`servercommon`) |
| 主責務 | `system.setting.cache.*` に従うキー単位キャッシュ |
| 連携 | 更新後の `evictAll()` で即時反映 |
| 再利用ポイント | 頻繁参照設定のDB負荷抑制 |

### SystemSettingHistoryService
| 項目 | 内容 |
| --- | --- |
| 種別 | 共通部品 (`servercommon`) |
| 主責務 | 更新前後差分を `system_setting_history` へ保存 |
| 入力 | `before`, `after`, `updatedBy`, `updatedAt` |
| 副作用 | 履歴INSERT |
| 再利用できるケース | 設定変更の監査証跡が必要な機能 |
