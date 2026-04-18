# バッチ名一覧取得API設計書

## 1. 目的
バッチ名（物理名）と表示名の一覧を取得し、画面のバッチ選択に提供する。

## 2. ユースケース
- バッチ処理結果一覧画面でのバッチ名選択
- バッチ名の表示名参照

## 3. API仕様

### 3-1. API一覧
| No | Method | Path | 内容 |
|----|--------|------|------|
| 1 | GET | `/system-transfer/batch-list/names` | バッチ名一覧取得 |

### 3-2. レスポンス
- `ApiResponse<List<BatchResponse>>`

`BatchResponse` の主要項目  
| 項目 | 型 | 説明 |
|------|----|------|
| batchName | String | 物理名 |
| displayName | String | 表示名 |

## 4. 処理フロー
1. `GET /system-transfer/batch-list/names` を受信する。
2. `BatchListService.getBatchNameList` が `BatchInfo.values()` を走査する。
3. `BatchResponse` に詰め替えて返却する。

## 5. モジュール構成
| 種別 | 実装名 | 役割 |
|------|--------|------|
| Controller | `BatchListController` | API受信 |
| Service | `BatchListService` | 一覧取得 |
| Enum | `BatchInfo` | バッチ名定義 |
| Response DTO | `BatchResponse` | 応答DTO |

## 6. 実装との整合
- エンドポイントは `GET /system-transfer/batch-list/names`。
- `BatchInfo` が一覧の正本である。

## 7. 関連資料
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/08_状態_コード定義/enum.md`

## 8. 要確認事項
- `BatchInfo.displayName` が最新の画面文言と一致しているか

## 9. 制約・注意事項
- 一覧の順序は `BatchInfo.values()` の定義順に依存する。

## 10. テスト観点
| 観点 | 内容 |
|------|------|
| 一覧件数 | `BatchInfo` の件数と一致 |
| 表示名 | `BatchInfo` からのマッピング |

## 11. 更新履歴
| ver | 更新日 | 更新者 | 内容 |
|-----|--------|--------|------|
| 1.0 | 要確認 | 要確認 | テンプレート準拠で全面リライト |
