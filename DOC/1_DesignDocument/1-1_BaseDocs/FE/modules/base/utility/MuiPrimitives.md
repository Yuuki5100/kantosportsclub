# 📄 MUIプリミティブモジュール仕様書

## 1. モジュール概要

### 1-1. 目的
本モジュールは、MUIの基本コンポーネント群（AppBar/Drawer/Modal 等）を **base 経由で再利用** できるように集約し、画面・複合コンポーネントからの直接的な MUI import を抑止することを目的とする。

### 1-2. 適用範囲
- composite / CRJ / pages での MUI 直接利用を避けたい箇所
- 既存の base コンポーネントが存在しないが、MUI の素の部品が必要な場面

---

## 2. 設計方針

### 2-1. アーキテクチャ
- MUI のコンポーネントを **base/Primitive** から再エクスポートする。
- 画面や複合コンポーネントは `@/components/base` から import する。

### 2-2. 統一ルール
- `@mui/material` を直接 import しない。
- 既存 base にラップコンポーネントがある場合はそちらを優先する。
- 表示仕様の統一が必要な場合は、このモジュール側の拡張を検討する。

---

## 3. 📂 フォルダ構成

```plaintext
components/
└── base/
    └── Primitive/
        └── index.ts     // MUIプリミティブの再エクスポート
```

---

## 4. 📌 エクスポート対象

- `AppBar` / `Toolbar`
- `Drawer` / `List` / `ListItemButton` / `ListItemIcon` / `ListItemText` / `Collapse`
- `Breadcrumbs` / `Link`
- `Modal`
- `Container`
- `Backdrop` / `CircularProgress`
- `Card` / `Divider` / `Paper`
- `ToggleButton` / `ToggleButtonGroup`

---

## 5. 🔍 使用例

```tsx
import { AppBar, Toolbar, Drawer, List } from "@/components/base";

<AppBar position="static">
  <Toolbar>...</Toolbar>
</AppBar>

<Drawer open={open}>
  <List>...</List>
</Drawer>
```

---

## 6. 注意点・補足
- 既存の base モジュール（Button/Input/Layout 等）が使える場合は **そちらを優先** する。
- MUI の依存を隠蔽するための窓口であり、ここ自体に業務ロジックは持たない。
