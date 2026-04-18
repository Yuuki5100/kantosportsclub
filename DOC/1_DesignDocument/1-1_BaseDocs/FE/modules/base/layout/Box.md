
## 📄 Boxモジュール仕様書

## 1. モジュール概要

### 1-1. 目的  
このモジュールは、MUIの `Box` コンポーネントをベースに、よく使用されるレイアウトパターン（縦並び、横並び、スタック配置）を簡潔に再利用可能な形で提供することを目的とする。コードの可読性・保守性を高め、全体のUI設計を統一する。

### 1-2. 適用範囲  
- フォーム、リスト、ダッシュボードなど、レイアウト全般
- ページ内の構造を柔軟に整えるためのベースレイアウト
- 繰り返し使用されるレイアウトパターンの共通化

---

## 2. 設計方針

### 2-1. アーキテクチャ

- **MUI `Box` ラップコンポーネント**
  - 各レイアウトコンポーネントは MUI の `Box` または `Stack` をラップし、初期スタイル（方向・揃え）をあらかじめ定義。
  - レイアウト構築における記述量を削減し、開発効率を向上させる。

- **デフォルトスタイルの統一**
  - `Box`: 縦並び・左寄せ  
  - `FlexBox`: 横並び・中央寄せ  
  - `StackBox`: スタック配置（縦並び・spacingあり）

### 2-2. 統一ルール

- 各コンポーネントは `BoxProps` を継承し、柔軟なスタイル変更を許容する。
- `sx`, `className`, `id`, `onClick` などの標準属性はそのまま使用可能。
- `Box`, `FlexBox`, `StackBox` という命名規則に統一する。

---

## 3. 📂 フォルダ構成とファイルの役割

```plaintext
components/
└── box/
    ├── Box.tsx         // 縦並び・左寄せの基本レイアウト
    ├── FlexBox.tsx     // 横並び・中央寄せの基本レイアウト
    ├── StackBox.tsx    // MUI Stack を用いた spacing ありの縦or横並び
    └── index.ts        // 上記コンポーネントのエクスポート集約
```

---

## 4. 📌 各ファイルの説明

### Box.tsx

**目的：**  
MUIの `Box` に `display="flex"` と `flexDirection="column"` をデフォルト指定し、縦並びかつ左寄せのベースコンポーネントとして提供。

```tsx
<MuiBox display="flex" flexDirection="column" alignItems="flex-start" {...rest}>
  {children}
</MuiBox>
```

---

### FlexBox.tsx

**目的：**  
横並び（row）＋中央揃えを初期状態としたレイアウトコンポーネント。

```tsx
<MuiBox display="flex" flexDirection="row" justifyContent="center" alignItems="center" {...rest}>
  {children}
</MuiBox>
```

---

### StackBox.tsx

**目的：**  
MUIの `Stack` コンポーネントをラップし、spacingを簡潔に指定できる再利用可能なコンポーネント。

```tsx
<Stack direction={direction} spacing={spacing} {...rest}>
  {children}
</Stack>
```

- `direction`: `"column"`（デフォルト）または `"row"`
- `spacing`: 子要素間のスペース指定（デフォルト: `2`）

---

### index.ts

**目的：**  
Boxモジュール内のコンポーネントを外部からまとめてインポートできるようにする。

```ts
export * from "./Box";
export * from "./FlexBox";
export * from "./StackBox";
```

---
