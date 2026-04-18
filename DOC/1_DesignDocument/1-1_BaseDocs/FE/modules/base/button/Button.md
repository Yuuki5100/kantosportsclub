# 📄 Buttonモジュール仕様書

## 1. モジュール概要

### 1-1. 目的  
このモジュールは、業務アプリケーションにおいて頻繁に使用されるボタン（「戻る」「次へ」「拒否」など）のUIを統一し、再利用可能なコンポーネントとして提供することを目的とする。ボタンのスタイル・ロジックの共通化により、UIの一貫性と保守性を高める。

### 1-2. 適用範囲  
- フォーム操作における画面遷移（戻る・次へ）  
- ワークフローや承認処理などのアクション（承認・拒否）  
- アイコンボタンによる軽量アクション（削除・編集など）

---

## 2. 設計方針

### 2-1. アーキテクチャ

- **汎用ボタン `ButtonBase` をベースに構成**  
  - スタイルやイベントハンドリングを共通化し、各種ボタン（戻る・次へ・拒否など）を`ButtonBase`のラップとして提供。

- **アイコン用ボタンは `IconButtonBase` で共通化**  
  - アイコンを用いた軽量操作のための基本ボタン。

- **型安全なProps設計**  
  - TypeScriptによってボタンの属性（label、onClickなど）を明確に定義し、型の安全性を確保。

### 2-2. 統一ルール

- 全ボタンは `ButtonHTMLAttributes<HTMLButtonElement>` を継承  
- `variant`, `color`, `onClick`, `disabled` などのプロパティは明示的に受け取る  
- スタイルはMUIの`Button`に依存、カスタマイズ可能な`sx`プロパティを使用  

---

## 3. 📂 フォルダ構成とファイルの役割

```plaintext
components/
└── base/
└── Button/
  ├── ButtonBase.tsx // 汎用ボタンの基本実装（スタイル・動作統一）
  ├── ButtonBack.tsx // 「戻る」ボタン：遷移やキャンセル用
  ├── ButtonNext.tsx // 「次へ」ボタン：確認や次ステップへ進む処理
  ├── ButtonReject.tsx // 「拒否」ボタン：ワークフロー系での否定的アクション
  ├── IconButtonBase.tsx // アイコンボタンの共通実装
  └── index.ts // ボタンモジュールのエクスポート集約
```

## 4. 📌 各ファイルの説明

### ButtonBase.tsx

**目的：**  
すべてのボタンの基盤となる汎用的なボタンコンポーネント。MUIの`Button`をベースにし、共通スタイルやイベントの設定を集約。

```tsx
<Button variant={variant} color={color} onClick={onClick} sx={sx} {...props}>
  {children}
</Button>
```

variant: "contained" | "outlined" | "text"（デフォルト: "contained"）
color: "primary" | "secondary" | "error" など
children: ボタン内に表示するテキストやコンテンツ


### ButtonBack.tsx

**目的：** 
画面を「戻る」処理に使用される共通ボタン。左矢印アイコンなどが含まれる可能性がある。

```tsx
<ButtonBase onClick={onBack} color="secondary">
  戻る
</ButtonBase>
```
onBack: 戻る処理用のイベントハンドラ

### ButtonNext.tsx

**目的：** 
画面遷移の「次へ」操作を行うボタン。右矢印などが付加されることが多い。

```tsx
<ButtonBase onClick={onNext} color="primary">
  次へ
</ButtonBase>
```
onNext: 次画面への処理

### ButtonReject.tsx

**目的：** 
申請拒否など、否定的なアクション用のボタン。

```tsx
<ButtonBase onClick={onReject} color="error">
  拒否
</ButtonBase>
```
onReject: 拒否時の処理

### IconButtonBase.tsx

**目的：**
アイコンのみで構成されたボタンを提供するベースコンポーネント。


```tsx
<IconButton {...props} />
```
props: 表示するアイコン要素（例: <DeleteIcon />

### index.ts

**目的：**
本モジュールで提供される全ボタンコンポーネントを一括でエクスポート。

```ts
export { default as ButtonBack } from "./ButtonBack";
export { default as ButtonBase } from "./ButtonBase";
export { default as ButtonNext } from "./ButtonNext";
export { default as ButtonReject } from "./ButtonReject";
export { default as IconButtonBase } from "./IconButtonBase";
```

