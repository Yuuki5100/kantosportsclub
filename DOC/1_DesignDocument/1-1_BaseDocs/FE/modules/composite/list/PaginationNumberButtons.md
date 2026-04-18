# PaginationNumberButtons モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`PaginationNumberButtons` は、現在ページ周辺の番号ボタンと省略記号を表示するページ番号ナビゲーション部品である。

### 1-2. 適用範囲
- 独自ページネーションバーの番号ボタン部
- ページ数が多い一覧画面
- 現在ページ周辺のみを簡潔に表示したいケース

---

## 2. 設計方針

### 2-1. アーキテクチャ
- ボタン描画には `ButtonAction` を利用する。
- 範囲外ページは `...` で省略表示する。
- 現在ページ前後の表示範囲は `range` で制御する。

### 2-2. 統一ルール
- `currentPage` `totalPages` は 1 ベース前提とする。
- 現在ページのボタンは `contained`、それ以外は `outlined` とする。
- 省略記号は `Font14` で表示する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── composite/
        └── Listview/
            └── PaginationNumberButtons.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `currentPage: number` - 現在ページ
- `totalPages: number` - 総ページ数
- `onPageChange: (page: number) => void` - ページ変更処理
- `range?: number` - 前後何ページ分を表示するか

**仕様:**
- 開始ページは `max(1, currentPage - range)` で算出する。
- 終了ページは `min(totalPages, currentPage + range)` で算出する。
- 先頭側・末尾側に未表示ページがある場合は `...` を描画する。

