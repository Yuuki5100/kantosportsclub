# 📘 FileUploader コンポーネント設計書

## ✅ 概要

`FileUploader` は最大3つまでファイルをアップロード・表示・ダウンロード・削除できる UI コンポーネントです。外部APIとの接続も可能で、Storybook 上でもモック的に確認が可能です。

---

## 📦 構成要素

### 1. `FileUploader.tsx`

* UIとイベントハンドラをまとめたトップレベルのコンポーネント。
* MUI の `AttachFileIcon` を左上に配置し、3スロット表示。
* 非表示の `<input type="file" />` を使用し、スロットクリックでアップロード可能。
* props:

  ```ts
  type FileUploaderProps = {
    onChange?: (files: UploadedFile[]) => void;
    initialFiles?: UploadedFile[];
  };
  ```

---

### 2. `FileSlot.tsx`

* 単一のスロット表示コンポーネント。
* ファイル名表示、または `"---------"` プレースホルダー。
* 右寄せで表示。
* 将来的に削除ボタン（✕）付きにも対応済み。

---

### 3. `useFileUploader.ts`

* アップロード/ダウンロード/削除を含む状態管理 Hook。
* `useMutation`（React Query）を使用してファイルアップロード。
* `showSnackbar()` によるステータス通知。
* 外部コールバック `onChange` にも対応。

```ts
export const useFileUploader = (options?: UseFileUploaderOptions) => {
  const { onChange, initialFiles } = options || {};
  ...
};
```

---

## 🔁 主な動作仕様

| 処理     | 内容                                                     |
| ------ | ------------------------------------------------------ |
| アップロード | 空スロットをクリック→ファイル選択→API呼び出し（`/api/files/upload`）         |
| ダウンロード | アップロード済ファイル名をクリックで `/api/files/:fileId/download` にアクセス |
| 削除     | ✕ ボタン押下で `deleteFileFromServer(fileId)` を呼び出し、配列から削除   |
| 変更通知   | `onChange(files)` が外部に通知される                            |

---

## 🧪 Storybook対応

### ✅ 登録済ストーリー

| Story              | 内容                                  |
| ------------------ | ----------------------------------- |
| `Default`          | 空スロット3つの初期状態                        |
| `WithOnChange`     | アップロード完了後にファイル一覧が `ul` に表示される動作確認付き |
| `WithInitialFiles` | 初期状態で2ファイル分の情報を持った状態で表示される          |

### ✅ Provider

以下をラップして正しく動作：

```tsx
<Provider store={store}>
  <QueryClientProvider client={queryClient}>
    ...
  </QueryClientProvider>
</Provider>
```

---

## 💻 UI仕様

| 要素      | レイアウト・スタイル                                             |
| ------- | ------------------------------------------------------ |
| 📎 アイコン | 左上、`32x32px`、`border + padding` あり                     |
| スロット    | 右寄せ `flex-end`、MUIベースのクリック可能テキスト                       |
| 削除ボタン   | ファイルがあるスロットに ✕ 表示（`onDelete` 実行）                       |
| 外枠      | `Section` で囲い、`maxWidth: 480px`, `minWidth: 360px` に調整 |
| フォント説明  | 「ファイル名は50文字」など補足あり                                     |

---

## 📂 型定義

```ts
export type UploadedFile = {
  fileId: string;
  fileName: string;
};
```

---

## 🚧 実装上の補足

* `deleteFileFromServer()` の中身は環境によってモック化可能（Storybook 用には Promise.resolve() にする）。
* `showSnackbar()` は `useSnackbar()` フックを通じて使用。
* ファイルは内部で `useState<UploadedFile[]>` によって管理。
* 同一ファイル名での再アップロードも許容（`e.target.value = ''` でクリア）。

---





