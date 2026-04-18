# バッチ処理結果一覧取得API設計書

## 1. 目的
バッチ処理実行結果の一覧を取得し、画面表示用に提供する。

## 2. ユースケース
- バッチ処理結果一覧画面での検索・表示
- エラー内容を画面に表示するための参照

## 3. API仕様

### 3-1. API一覧
| No | Method | Path | 内容 |
|----|--------|------|------|
| 1 | GET | `/system-transfer/batch-list` | バッチ処理結果一覧取得 |

### 3-2. リクエスト（クエリパラメータ）
| 項目 | 型 | 必須 | 説明 |
|------|----|------|------|
| base | String | 任意 | 拠点コードまたは拠点名 |
| batch | String | 任意 | バッチ名 |
| startDate | String | 任意 | 実行開始日 |
| pageNo | int | 任意 | ページ番号。未指定時は0 |
| pageSize | int | 任意 | ページサイズ。未指定時は0 |
| sortKey | String | 任意 | 並び順キー |
| sortOrder | String | 任意 | 並び順（ASC/DESC） |
| baseExtMatFlag | boolean | 任意 | 拠点の完全一致判定 |
| batchExtMatFlag | boolean | 任意 | バッチ名の完全一致判定 |

### 3-3. レスポンス
- `ApiResponse<CommonListResponse<BaseListQueryResult>>`

`BaseListQueryResult` の主要項目  
| 項目 | 型 | 説明 |
|------|----|------|
| baseCd | String | 拠点コード |
| baseName | String | 拠点名 |
| batchName | String | バッチ名表示（`BatchInfo` の表示名に変換後） |
| startDateAndTime | LocalDateTime | 実行開始日時 |
| endDateAndTime | LocalDateTime | 実行終了日時 |
| statusName | String | ステータス名 |
| errorMessege | String | エラーメッセージ |

## 4. 処理フロー
1. `GET /system-transfer/batch-list` を受信する。
2. `BatchListController` が `BaseListRequest` を受け取り `BatchListService.getBaseList` を呼び出す。
3. `BatchListService` が `BaseListParam` に変換し `BatchListMapper.getMappedBatchList` を実行する。
4. `BatchListMapper` が SQL で一覧を取得し `BaseListQueryResult` にマッピングする。
5. `BatchListService` がエラーメッセージを定義済みメッセージへ整形する。
6. `CommonListResponse` を `ApiResponse.success` で返却する。

## 5. モジュール構成
| 種別 | 実装名 | 役割 |
|------|--------|------|
| Controller | `BatchListController` | API受信 |
| Service | `BatchListService` | 一覧取得とメッセージ整形 |
| Request DTO | `BaseListRequest` | 検索条件 |
| Mapper | `BatchListMapper` | 一覧取得SQL |
| Mapper XML | `BatchListMapper.xml` | SQL定義 |
| Response DTO | `BaseListQueryResult` | 一覧要素 |
| Param | `BaseListParam` | Mapper用パラメータ |
| Enum | `BatchInfo` | バッチ名の表示名定義 |

## 6. 実装との整合
- エンドポイントは `GET /system-transfer/batch-list`。
- `BatchListMapper` 内で `BatchInfo` により `batchName` を表示名へ変換する。
- エラーメッセージは `ErrorCodeService` で取得した定義済み文言に置換される。

## 7. 関連資料
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/07_例外処理/LogErrorHandling.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/BE/08_状態_コード定義/enum.md`

## 8. 要確認事項
- `startDate` の受け入れフォーマット
- 画面側の検索条件仕様と一致しているか

## 9. 制約・注意事項
- `sortKey` は `startDate` / `endDate` / `baseCd` / `baseName` / `batchName` のみを前提としている。
- `sortOrder` は `ASC` / `DESC` 以外を渡すとSQLエラーになる可能性がある。
- `baseExtMatFlag` / `batchExtMatFlag` により完全一致と部分一致が切り替わる。

## 10. テスト観点
| 観点 | 内容 |
|------|------|
| 検索条件 | base/batch/startDate の完全一致・部分一致 |
| 並び順 | sortKey/sortOrder の組み合わせ |
| メッセージ整形 | 定義済みメッセージの置換 |
| 表示名変換 | BatchInfo による表示名変換 |
| ページング | pageNo/pageSize の反映 |

## 11. 更新履歴
| ver | 更新日 | 更新者 | 内容 |
|-----|--------|--------|------|
| 1.0 | 要確認 | 要確認 | テンプレート準拠で全面リライト |
