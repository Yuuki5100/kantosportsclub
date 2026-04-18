# GlobalReportJobWatcher モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`GlobalReportJobWatcher` は、レポート出力ジョブの状態をグローバルに監視し、完了または失敗を Redux に反映する常駐コンポーネントである。

### 1-2. 適用範囲
- 非同期レポート出力の完了監視
- ダウンロード URL の受け取り
- 失敗時のジョブ状態更新

---

## 2. 設計方針

### 2-1. アーキテクチャ
- Redux `reportJob` state から `jobId` と `status` を取得する。
- `useReportPollingStatus(jobId, isPollingEnabled)` でポーリングを行う。
- 結果に応じて `completeJob` または `failJob` を dispatch する。

### 2-2. 統一ルール
- `jobId` があり、かつ `status === 'RUNNING'` の場合のみ監視を有効化する。
- UI は持たず `null` を返す。
- 完了時は URL を Redux に保存する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── functional/
        └── GlobalReportJobWatcher.tsx
```

---

## 4. コンポーネント仕様

**監視対象 state:**
- `jobId` - 監視対象ジョブ ID
- `status` - ジョブ状態

**仕様:**
- API 応答の `data.data.status` を参照して状態判定する。
- `COMPLETED` では `completeJob(url ?? '')` を dispatch する。
- `FAILED` では `failJob()` を dispatch する。

