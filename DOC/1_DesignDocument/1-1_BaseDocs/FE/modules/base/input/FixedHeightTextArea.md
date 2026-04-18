# FixedHeightTextArea モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`FixedHeightTextArea` は、行数固定の複数行入力欄を提供する入力コンポーネントである。改行入力を抑制しつつ、一定高さのテキスト表示領域として利用する。

### 1-2. 適用範囲
- 行数を固定したコメント入力欄
- 改行を許可しない疑似複数行表示欄
- 文字数カウンタ付きの入力欄

---

## 2. 設計方針

### 2-1. アーキテクチャ
- MUI の `TextField` を `multiline` で利用する。
- 表示は複数行だが、入力値から改行を除去し、Enter キーも抑止する。
- `FormHelperText` を右下に固定配置し、文字数を表示する。

### 2-2. 統一ルール
- `rowLength` を必須とし、表示高さを明示する。
- `maxLength` 指定時は超過入力を受け付けない。
- disabled 時は背景色と文字色を固定し、見た目を統一する。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── base/
        └── Input/
            └── FixedHeightTextArea.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `name: string` - フィールド名
- `id?: string` - DOM ID
- `value?: string` - 制御値
- `defaultValue?: string` - 初期値
- `onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>` - フォーカスアウト時処理
- `onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void` - 値変更時処理
- `maxLength?: number` - 最大文字数
- `disabled?: boolean` - 非活性制御
- `helperText?: string` - 現行実装では未表示
- `error?: boolean` - エラー表示
- `customStyle?: object` - 追加スタイル
- `width?: string` - 横幅
- `rowLength: number` - 表示行数

**仕様:**
- `defaultValue` と `value` は改行を除去して保持・表示する。
- Enter キー押下時は `preventDefault` し、改行入力を防ぐ。
- 右下には `現在文字数 / 最大文字数` または `現在文字数 文字` を表示する。
- 外側コンテナに `minWidth: 400px`、`maxWidth: 800px` を持つ。

