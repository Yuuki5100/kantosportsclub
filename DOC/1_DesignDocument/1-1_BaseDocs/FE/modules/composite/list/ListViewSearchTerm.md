# ListViewSearchTerm モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`ListViewSearchTerm` は、検索対象カラム・キーワード・並び順・昇順/降順をまとめて操作できる簡易検索条件コンポーネントである。実装上の公開名は `SearchTerm` である。

### 1-2. 適用範囲
- 小規模な一覧検索 UI
- クライアントサイド検索や簡易ソート条件入力
- ListView に付随する補助検索バー

---

## 2. 設計方針

### 2-1. アーキテクチャ
- `DropBox` `TextBox` `ToggleButtonGroup` を組み合わせて構成する。
- 検索キーワード入力欄の末尾には `SearchIcon` ボタンを配置する。
- 内部 state に `SearchParams` を保持し、検索実行時とソート変更時で親に通知する。

### 2-2. 統一ルール
- 初期値は `searchColumns[0]` と `sortColumns[0]` を採用する。
- 昇順/降順は `asc` / `desc` のみを受け付ける。
- 検索実行は検索アイコン押下で明示的に行う。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── composite/
        └── Listview/
            └── ListViewSearchTerm.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `searchColumns: string[]` - 検索対象候補
- `sortColumns: string[]` - 並び順候補
- `onSearch: (params: SearchParams) => void` - 検索実行時処理
- `onSortChange: (params: SearchParams) => void` - ソート条件変更時処理

**仕様:**
- `keyword` 入力時は内部 state のみ更新する。
- `sortColumn` 変更時は state 更新と同時に `onSortChange` を呼ぶ。
- `sortOrder` 変更時も同様に `onSortChange` を呼ぶ。
- 検索対象・並び順候補は文字列配列からそのまま `DropBox` 用 options に変換する。

