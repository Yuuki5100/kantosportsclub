# ErrorBoundary モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`ErrorBoundary` は、配下コンポーネントで発生した描画系エラーを捕捉し、フォールバック UI を表示するための境界コンポーネントである。

### 1-2. 適用範囲
- 画面単位の例外保護
- クラッシュ防止
- ログ出力付きのフォールバック表示

---

## 2. 設計方針

### 2-1. アーキテクチャ
- React クラスコンポーネントとして実装する。
- `getDerivedStateFromError` でエラー状態へ遷移する。
- `componentDidCatch` でロガーへ記録する。

### 2-2. 統一ルール
- `fallback` 指定時はそれを優先表示する。
- 未指定時は `Something went wrong.` を表示する。
- ログ取得は `getLogger()` を通じて行う。

---

## 3. 📂 フォルダ構成

```plaintext
src/
└── components/
    └── functional/
        └── ErrorBoundary.tsx
```

---

## 4. コンポーネント仕様

**主な props:**
- `children: ReactNode` - 保護対象のコンポーネント
- `fallback?: ReactNode` - エラー時表示内容

**状態:**
- `hasError: boolean` - エラー発生有無
- `error?: Error` - 捕捉したエラー

**仕様:**
- 描画中エラー発生時は `hasError: true` に遷移する。
- `componentDidCatch` では error と errorInfo をロガー出力する。
- 例外通知基盤の追加ポイントとして利用できる。

