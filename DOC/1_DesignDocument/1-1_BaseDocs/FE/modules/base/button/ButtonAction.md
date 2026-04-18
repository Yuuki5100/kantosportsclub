# ButtonAction モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`ButtonAction` は、汎用ボタン `ButtonBase` をそのまま利用しつつ、画面側で扱いやすいアクションボタンとして公開する薄いラッパーコンポーネントである。

### 1-2. 適用範囲
- 一覧画面・ダイアログ・フォーム下部の実行ボタン
- ラベル付きの単純な押下アクション
- `ButtonBase` を直接参照せず、用途名でボタンを表現したい箇所

---

## 2. 設計方針

### 2-1. アーキテクチャ
- `ButtonBase` の props をほぼそのまま受け渡す構成とする。
- ボタン固有の見た目やロジックは持たず、アクション実行用の別名コンポーネントとして提供する。

### 2-2. 統一ルール
- 画面固有の見た目調整は `sx` で上書きする。
- `label` を必須とし、ボタン文言の明示を徹底する。
- `variant` `color` `size` は MUI のボタン仕様に合わせる。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── base/
        └── Button/
            └── ButtonAction.tsx
```

---

## 4. コンポーネント仕様

**目的:**
`ButtonBase` をベースにしたシンプルなアクションボタンを提供する。

**主な props:**
- `label: string` - ボタン表示文言
- `onClick?: () => void` - 押下時の処理
- `disabled?: boolean` - 非活性制御
- `color?: "primary" | "secondary" | "success" | "error" | "info" | "warning"` - ボタン色
- `size?: "small" | "medium" | "large"` - ボタンサイズ
- `width?: number | string` - 幅指定
- `type?: "button" | "submit" | "reset"` - ボタン種別
- `variant?: ButtonProps["variant"]` - MUI のバリアント
- `sx?: SxProps<Theme>` - 追加スタイル

**仕様:**
- 内部実装では `<ButtonBase {...props} />` のみを行う。
- `ButtonBase` の振る舞いを変更せず再利用する。
- 一覧のページ番号ボタンなど、小粒なアクションにも利用可能。

