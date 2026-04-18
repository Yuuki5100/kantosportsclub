# FileImportSection モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`FileImportSection` は、CSV または Excel ファイルを選択し、親コンポーネントへアップロード対象として渡す最小構成の入力セクションである。

### 1-2. 適用範囲
- 管理画面の簡易インポート機能
- 検証用・サンプル用のファイルアップロード UI
- 1 ファイルのみ扱うシンプルな取込操作

---

## 2. 設計方針

### 2-1. アーキテクチャ
- 内部 state に `selectedFile` を保持する。
- `<input type="file">` と `<button>` の最小構成で実装する。
- アップロード実行は親コンポーネントへ委譲する。

### 2-2. 統一ルール
- 受け付けるファイル種別は CSV と Excel とする。
- ボタン押下時に `selectedFile` を `onUpload` へ渡す。
- UI は簡易構成で、装飾やバリデーションは持たない。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── functional/
        └── FileImportSection.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `onUpload: (file: File | null) => void` - アップロード処理

**仕様:**
- `accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"` を指定する。
- 未選択のままでも `null` を親へ渡せる構成とする。
- 現行実装ではドラッグ&ドロップや複数選択には対応しない。

