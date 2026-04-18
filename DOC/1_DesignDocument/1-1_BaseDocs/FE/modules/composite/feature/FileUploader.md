# FileUploader モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`FileUploader` は、ファイル添付・一覧表示・ダウンロード・削除を 1 つの UI として提供するコンポーネントである。内部では 3 スロット固定の添付欄を持つ。

### 1-2. 適用範囲
- 添付ファイルを最大 3 件まで扱う入力画面
- 既存ファイルの表示と再ダウンロードが必要な画面
- ファイル選択 UI を統一したい画面

---

## 2. 設計方針

### 2-1. アーキテクチャ
- ファイル操作ロジックは `useFileUploader` フックに集約する。
- 表示は `FileSlot` を 3 件固定で描画する。
- 隠し `input[type=file]` を `ref` 経由で起動する。

### 2-2. 統一ルール
- 初期ファイルは `initialFiles` で外部から注入する。
- 非活性時は添付・削除を無効化する。
- ファイル名説明文として「ファイル名は50文字まで添付できます」を表示する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── composite/
        └── FileUpload/
            ├── FileUploader.tsx
            └── FileSlot.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `onChange?: (files: UploadedFile[]) => void` - ファイル一覧変更通知
- `initialFiles?: UploadedFile[]` - 初期ファイル一覧
- `disabled?: boolean` - 非活性制御
- `endpoints?: FileUploaderEndpoints` - アップロード/削除/取得 API 設定

**仕様:**
- 内部で `files`, `setFiles`, `handleDownload`, `fileInputRef`, `handleFileChange`, `deleteFile` を利用する。
- `initialFiles` 変更時は `useEffect` で内部 state を同期する。
- `FileSlot` は `[0,1,2]` の 3 スロット固定で描画する。
- 空スロット押下時はファイル選択ダイアログを開き、添付済みスロット押下時はダウンロードを行う。

