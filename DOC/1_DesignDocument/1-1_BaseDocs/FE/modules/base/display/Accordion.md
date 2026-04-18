  ## 📄 CommonAccordion モジュール仕様書

## 1. モジュール概要

### 1-1. 目的
`CommonAccordion` は、Material UI の `Accordion` コンポーネントをベースに、簡易で再利用可能なアコーディオンUIを提供する。主にフォームや検索条件エリアなどでの展開・折りたたみUIを統一したスタイルで実装することを目的とする。

### 1-2. 適用範囲
- 検索条件エリアの展開/折りたたみ
- 詳細情報の表示切り替え
- 任意のセクションの一時的な開閉UI

---

## 2. 設計方針

### 2-1. アーキテクチャ
- MUIの `Accordion`, `AccordionSummary`, `AccordionDetails` をベースに構築。
- 必須項目は `title` と `children`。タイトルを表示し、中身は任意の要素を渡す。
- 開閉状態の制御は内部で行い、必要に応じて拡張可能。

### 2-2. コンポーネント構造

```tsx
<Accordion>
  <CommonAccordionSummary
    title={title}
    expanded={expanded}
    toggleExpanded={() => setExpanded(prev => !prev)}
  />
  <AccordionDetails>
    {children}
  </AccordionDetails>
</Accordion>
```
- expandIcon はデフォルトで展開アイコンを表示。
- sx により、親要素からスタイルのカスタマイズが可能。

---

## 3. 📂 フォルダ構成とファイルの役割
```plaintext
components/
└── common/
    ├── CommonAccordion.tsx    // アコーディオン本体コンポーネント
    └── index.ts               // エクスポート集約用ファイル
```

---
## 4. 📌 ファイル詳細
***CommonAccordion.tsx***

**目的：**
Material UI アコーディオンをラップし、共通利用可能なアコーディオンUIを提供する。

| Prop              | 型                | 必須 | 説明                    |
| ----------------- | ---------------- | -- | --------------------- |
| `title`           | `string`         | ✅  | アコーディオンヘッダーの表示名       |
| `children`        | `ReactNode`      | ✅  | 折りたたみ内の任意の要素          |
| `sx`              | `SxProps<Theme>` | 任意 | 外側ラップに対するカスタムスタイル     |
| `defaultExpanded` | `boolean`        | 任意 | 初期展開状態（デフォルト: `true`） |

**コード例:**
```tsx
import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SxProps, Theme } from '@mui/system';

type Props = {
  title: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  defaultExpanded?: boolean;
};

const CommonAccordion: React.FC<Props> = ({
  title,
  children,
  sx,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Accordion sx={sx} expanded={expanded} onChange={() => setExpanded(prev => !prev)}>
      <CommonAccordionSummary
        title={title}
        expanded={expanded}
        toggleExpanded={() => setExpanded(prev => !prev)}
      />
      <AccordionDetails sx={{ overflow: 'hidden' }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default CommonAccordion;

index.ts
export { default as CommonAccordion } from './CommonAccordion';
```

---

## 5. 🔍 使用例

```tsx
import { CommonAccordion } from '@/components/common/CommonAccordion';
<CommonAccordion title="検索条件">
  <Box>
    <TextField label="名前" />
    <Button>検索</Button>
  </Box>
</CommonAccordion>
```

---

## 6. 注意点・補足
- children に高さが固定されていない要素が大量にあると、親レイアウトが崩れる場合があります。必要に応じて maxHeight + overflowY: auto を AccordionDetails に追加可能。
- sx により、各ページ側での背景色やマージンなどの微調整に対応。

---
