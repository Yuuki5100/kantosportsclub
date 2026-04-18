# ClickableFont14 モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`ClickableFont14` は、`Font14` をクリック可能な表示部品として利用するための軽量ラッパーである。リンク風の文字列表示やファイル名クリックなど、テキスト主体の操作導線を統一する。

### 1-2. 適用範囲
- ファイル名リンク
- 一覧内の簡易操作テキスト
- 14px テキストでクリックイベントを持たせたい箇所

---

## 2. 設計方針

### 2-1. アーキテクチャ
- 外側は `span` とし、`cursor: pointer` を付与する。
- 実際の文字描画は `Font14` に委譲する。
- `className` `style` `sx` を透過的に受け取り、既存の表示部品として使いやすくする。

### 2-2. 統一ルール
- クリックイベントは外側の `span` で受ける。
- テキストサイズは `Font14` に固定し、ばらつきを防ぐ。
- 表示上の色や装飾は `sx` 側で調整する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── base/
        └── Font/
            └── ClickableFont14.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `children: React.ReactNode` - 表示文字列
- `onClick: () => void` - クリック時処理
- `className?: string` - CSS クラス
- `style?: React.CSSProperties` - インラインスタイル
- `sx?: SxProps<Theme>` - `Font14` に渡す MUI スタイル

**仕様:**
- 外側要素は `span` 固定とする。
- `Font14` に `className` `style` `sx` を渡して描画する。
- 下線や色変更などのリンク風表現は利用側で制御する。

