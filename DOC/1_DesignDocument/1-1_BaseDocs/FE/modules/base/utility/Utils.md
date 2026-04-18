了解！では、`TooltipWrapper` / `Spacer` / `InlineLabel` / `EllipsisText` を含む「**base系ユーティリティコンポーネント群**」の

## 📄 Baseユーティリティコンポーネント仕様書

## 1. モジュール概要

### 1-1. 目的  
本モジュールは、レイアウト調整やUI補助のために頻繁に利用される軽量なユーティリティコンポーネントを共通化し、開発の簡素化とUI整合性の向上を図るものである。

### 1-2. 適用範囲  
- ボタンやテキスト周りの補助的なUI表現
- 再利用可能な簡易スタイルや構造の抽象化
- スペース調整、ツールチップ表示、インライン要素の整形など

---

## 2. 設計方針

### 2-1. アーキテクチャ

- **MUIコンポーネントの軽量ラップ**
  - 基本的には `Box`, `Typography`, `Tooltip` などのMUI標準コンポーネントをラップし、シンプルな再利用単位に分離。

- **スタイル・動作のデフォルト化**
  - 毎回同じスタイルを手書きするのを避け、予測可能なデフォルト挙動を持たせる。

### 2-2. 統一ルール

- すべてのユーティリティは `base` ディレクトリに配置
- 他コンポーネントと組み合わせて使いやすい最小限の責務を持つ
- `sx`, `className`, `children` 等の汎用属性を継承可能とする（必要に応じて）

---

## 3. 📂 フォルダ構成とファイルの役割

```plaintext
components/
└── base/
    ├── TooltipWrapper.tsx      // ツールチップラッパー
    ├── Spacer.tsx              // 空白スペース生成用
    ├── InlineLabel.tsx         // インラインのラベル＋アイコン表示
    ├── EllipsisText.tsx        // 省略表示テキスト
    └── index.ts                // 上記コンポーネントのエクスポート集約
```

---

## 4. 📌 各ファイルの説明

### TooltipWrapper.tsx

**目的：**  
任意のコンポーネントにツールチップ（説明）を簡単に付与する。

**主な仕様：**
- MUIの `Tooltip` をラップ
- `arrow`, `placement="top"`, `enterDelay=300` をデフォルト指定
- 任意のReact要素を `children` に渡す

```tsx
<TooltipWrapper title="説明文">
  <SomeComponent />
</TooltipWrapper>
```

---

### Spacer.tsx

**目的：**  
横または縦のスペースを生成する。

**主な仕様：**
- `height`, `width` をpropsで指定（数値 or CSS文字列）
- `flexShrink=0` で潰れを防止

```tsx
<Spacer height={16} />
<Spacer width="1rem" />
```

---

### InlineLabel.tsx

**目的：**  
アイコン＋テキストを横並びで表示。

**主な仕様：**
- `icon` (任意) + `label` (テキスト) を `flex` で整形
- `gap=1` によるスペース指定

```tsx
<InlineLabel icon={<InfoIcon />} label="ヘルプ情報" />
```

---

### EllipsisText.tsx

**目的：**  
横幅制限されたテキストを `...` で省略表示。

**主な仕様：**
- `overflow: hidden`, `whiteSpace: nowrap`, `textOverflow: ellipsis`
- `BoxProps` を継承して、`sx` や `width` も柔軟に指定可能

```tsx
<EllipsisText sx={{ width: 200 }}>とても長いテキストがここに...</EllipsisText>
```

---

## ✅ 備考

- これらは今後 `Table`, `Button`, `Label` など様々なコンポーネントと組み合わせての利用が想定される。
- 今後もこの `base` ディレクトリに、軽量で再利用性の高いコンポーネントを追加していくことを推奨する。

---
