
## 📄 Layoutモジュール仕様書

## 1. モジュール概要

### 1-1. 目的  
このモジュールは、ページ全体の構造を構築するための基本的なレイアウトコンポーネントを提供する。ページ枠、セクション、区切り線など、アプリケーションの視覚的構成を統一されたデザインで表現できるようにすることが目的である。

### 1-2. 適用範囲  
- ページ単位のレイアウト構築（画面全体の枠）
- セクションごとの囲み・グルーピング
- 区切り線＋タイトル表示による構造の明示

---

## 2. 設計方針

### 2-1. アーキテクチャ

- **MUIのレイアウト系コンポーネント（Box、Paper、Divider）をラップ**
  - ページ構造を表現するための再利用可能なUIパーツとして設計。
  - デフォルトで統一された余白・スタイルを持たせつつ、柔軟なカスタマイズも可能とする。

### 2-2. 統一ルール

- 余白・幅・スタイルの統一（`padding`, `margin`, `maxWidth`など）
- コンポーネントごとに責務を明確化：
  - `PageContainer`: 全体枠
  - `Section`: セクション囲い
  - `DividerWithLabel`: 見出し付きの区切り線

---

## 3. 📂 フォルダ構成とファイルの役割

```plaintext
components/
└── layout/
    ├── PageContainer.tsx        // ページ全体のレイアウトを整えるベース枠
    ├── Section.tsx              // パネルやカードのような囲み用セクション
    ├── DividerWithLabel.tsx     // 見出し付きの横線（セクションタイトル）
    └── index.ts                 // 上記コンポーネントのエクスポート集約
```

---

## 4. 📌 各ファイルの説明

### PageContainer.tsx

**目的：**  
ページ全体の中央寄せ、幅制限、適切なパディングを行うベースコンテナ。

```tsx
<Box maxWidth="lg" mx="auto" px={3} py={4} {...rest}>
  {children}
</Box>
```

- 横幅を `maxWidth="lg"` に制限し、中央寄せ (`mx="auto"`)
- デフォルトで `px: 3`, `py: 4` の余白

---

### Section.tsx

**目的：**  
セクション単位の囲み（パネル、カード）を提供。`Paper` をベースに、軽い影と内側の余白を持たせたデザイン。

```tsx
<Paper elevation={2} sx={{ p: 3, mb: 4 }} {...rest}>
  {children}
</Paper>
```

- デフォルトで `padding: 3`, `margin-bottom: 4`
- `elevation=2` によりカードのような立体感

---

### DividerWithLabel.tsx

**目的：**  
区切り線の中央にラベル（セクション名）を表示するコンポーネント。

```tsx
<Box display="flex" alignItems="center" my={2}>
  <Divider sx={{ flexGrow: 1 }} />
  <Typography variant="subtitle2" sx={{ px: 2, whiteSpace: 'nowrap' }}>
    {label}
  </Typography>
  <Divider sx={{ flexGrow: 1 }} />
</Box>
```

- 横線 (`Divider`) の中央に `label` を表示
- デフォルトで上下 `margin: 2`

---

### index.ts

**目的：**
Layoutモジュール内のコンポーネントをまとめてエクスポートする。

```ts
export * from "./PageContainer";
export * from "./Section";
export * from "./DividerWithLabel";
```

---
