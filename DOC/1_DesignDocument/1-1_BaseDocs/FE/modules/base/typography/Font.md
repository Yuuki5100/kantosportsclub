# 📄 Fontモジュール仕様書

## 1. モジュール概要

### 1-1. 目的  
このモジュールは、アプリケーション内で使用されるテキストコンポーネントに対して、一貫したフォントサイズ・スタイル・構造を提供することを目的とする。デザインルールの統一により、UI全体の整合性を確保し、可読性と保守性の高いコードを実現する。

### 1-2. 適用範囲  
- タイトル、見出し、本文など、全般的なテキスト出力  
- サイズ・色・ウェイトが固定または限定された表示  
- 再利用可能なテキストコンポーネントのベース設計

---

## 2. 設計方針

### 2-1. アーキテクチャ

- **`FontBase` による共通ロジック定義**  
  - HTMLタグ、フォントサイズ、色、ウェイト、マージンなどのスタイルを集中管理し、共通化を図る。

- **サイズ固定コンポーネント（Font10〜Font30）**  
  - よく使うフォントサイズごとに専用コンポーネントを用意し、冗長な `sx={{ fontSize: xx }}` の記述を排除。

### 2-2. 統一ルール

- すべてのフォントコンポーネントは `FontBase` を通じて構築  
- テキストカラー、ウェイト、余白などは `props` により柔軟に指定可能  
- 基本タグは `<span>`、必要に応じて `<p>` や `<div>` 等への変更も可能  

---

## 3. 📂 フォルダ構成とファイルの役割

```plaintext
components/
└── base/
└── Font/
├── FontBase.tsx // テキスト共通スタイルの実装
├── Font10.tsx // 10pxフォントコンポーネント
├── Font12.tsx // 12pxフォントコンポーネント
├── Font14.tsx // 14pxフォントコンポーネント
├── Font16.tsx // 16pxフォントコンポーネント
├── Font18.tsx // 18pxフォントコンポーネント
├── Font20.tsx // 20pxフォントコンポーネント
├── Font24.tsx // 24pxフォントコンポーネント
├── Font30.tsx // 30pxフォントコンポーネント
└── index.ts // フォントコンポーネントのエクスポート集約
```

## 4. 📌 各ファイルの説明

### FontBase.tsx

**目的：**  
全てのフォント表示コンポーネントに共通するスタイルとロジックを提供するベースコンポーネント。

```tsx
<span style={{ fontSize, color, fontWeight, margin }}>{children}</span>
```
fontSize: フォントサイズ（px指定）
color: テキストカラー（デフォルト: "inherit"）
fontWeight: normal / bold など
margin: 外部余白（デフォルト: 0）

### Font10〜Font30.tsx

**目的：**  
```tsx
<FontBase fontSize={10}>
  {children}
</FontBase>
```
ファイル名と fontSize は一致（例：Font14 → 14px）
使用例：<Font16 color="gray">説明テキスト</Font16>


### index.ts

**目的：**  
本モジュールの全コンポーネントを一括エクスポートし、他モジュールからのインポートを簡略化。

```ts
export { default as Font10 } from "./Font10";
export { default as Font12 } from "./Font12";
export { default as Font14 } from "./Font14";
export { default as Font16 } from "./Font16";
export { default as Font18 } from "./Font18";
export { default as Font20 } from "./Font20";
export { default as Font24 } from "./Font24";
export { default as Font30 } from "./Font30";
export { default as FontBase } from "./FontBase";
```

