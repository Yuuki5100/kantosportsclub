## 📄 エラーメッセージカタログ（Message Catalog）仕様書

## 1. モジュール概要

### 1-1. 目的
フロントエンドで表示するエラーメッセージを一元管理し、表現の統一・重複排除・保守性向上を実現する。

### 1-2. 適用範囲
- API/通信エラーのフォールバックメッセージ
- UI通知（Snackbar / Error表示）
- ファイルバリデーション（CSV/Excel）や入力バリデーションの共通文言
- 画面側の固定メッセージ（エラー・警告・結果表示）

---

## 2. 設計方針

### 2-1. 管理方式
- **メッセージはコードと本文で管理**する。
- **表示文字列は `MessageIds` に集約**し、呼び出し側では `getMessage` を利用する。
- **日本語表記に統一**し、絵文字・過剰な記号（例: 「！」）は使用しない。

### 2-2. 重複排除ルール
- 意味が重複する文言は **共通コードに集約**する。
- 成功/失敗などの汎用表現は **`ACTION_SUCCESS / ACTION_FAILED` を優先**する。

---

## 3. 仕様

### 3-1. 参照先
- 実装ファイル: `FE/spa-next/my-next-app/src/message/index.ts`

### 3-2. エクスポート
```ts
export const MessageCodes = { ... } as const;
export const MessageIds: Record<string, MessageType> = { ... };
export const getMessage = (code: string, ...params: (string | number)[]) => { ... };
```

### 3-3. 利用例
```ts
showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "更新"), "ERROR");

setInternalHelperText(getMessage(MessageCodes.DATE_INVALID));
```

---

## 4. 追加・更新ルール

- **新規追加時は `MessageCodes` / `MessageIds` を必ずセットで追加**する。
- **本文は日本語で統一**し、絵文字・過剰な感嘆符は禁止。
- **既存文言と意味が重複しないか確認**し、可能なら既存コードを再利用する。
- **動的文言はテンプレート関数で管理**（例: `ACTION_FAILED`）。

---

## 5. 呼び出し側のルール

- エラー/通知メッセージは **直接文字列を埋め込まない**。
- `getMessage(MessageCodes.XXX)` を経由して取得する。
- API の `handleApiError` には **MessageCodes の文言を指定**する。

---

## 6. ESLint ルール

- 生文字列エラーを禁止する ESLint ルールが設定されている。
- 例: `showSnackbar("...", "ERROR")` や `new Error("...")` は禁止。

---

## 7. 備考

- 画面固有の文言を追加する場合は、必ずカタログに登録してから使用する。
- テストコードではルールが緩和されるが、可能な限り本カタログに寄せること。

