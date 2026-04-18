# 📘 AutoResizingTextBox 仕様書

## 🧩 概要

`AutoResizingTextBox` は、テキストの内容に応じて高さが変化し、必要に応じて単位表示・クリアボタンなどの UI 拡張が可能な**多機能テキストエリアコンポーネント**です。

* **自動高さ調整（minRows 単位）**
* **最大文字数制限**
* **単位ラベル表示（右側）**
* **クリアボタン表示・制御**
* **disabled 時のスタイル最適化**

---

## 🛠 使用方法

```tsx
<AutoResizingTextBox
  name="memo"
  value={memoText}
  onChange={(e) => setMemoText(e.target.value)}
  maxLength={100}
  unit="文字"
  clearButton
  helperText="最大100文字"
  error={hasError}
  disabled={isDisabled}
/>
```

---

## 💡 Props 詳細

| Prop名                | 型                                                  | 必須 | 説明                                   |
| -------------------- | -------------------------------------------------- | -- | ------------------------------------ |
| `name`               | `string`                                           | ✅  | フィールド名                               |
| `id`                 | `string`                                           |    | DOM用のID指定（任意）                        |
| `value`              | `string`                                           |    | テキストの値（controlled）                   |
| `onChange`           | `(e: React.ChangeEvent<HTMLInputElement>) => void` |    | 値変更ハンドラ                              |
| `onBlur`             | `(e: FocusEvent<HTMLInputElement>) => void`        |    | フォーカス離脱時のハンドラ                        |
| `disabled`           | `boolean`                                          |    | 入力不可状態を制御（背景色変化含む）                   |
| `maxLength`          | `number`                                           |    | 入力最大文字数を制限                           |
| `unit`               | `string`                                           |    | テキストボックス右端に表示される単位（例: `"文字"`, `"円"`） |
| `helperText`         | `string`                                           |    | 下部に表示される補足テキスト                       |
| `error`              | `boolean`                                          |    | エラーステータスの制御（赤枠など）                    |
| `customStyle`        | `object`                                           |    | カスタムスタイル（MUI sx に準ずる）                |
| `clearButton`        | `boolean`                                          |    | 右端にクリアボタン（×）を表示                      |
| `clearButtonOnClick` | `() => void`                                       |    | クリアボタン押下時のハンドラ（省略時は空文字で onChange）    |
| `minRows`            | `number`                                           |    | テキストエリアの最小行数（デフォルト: `1`）             |

---

## 🎨 UI 表示例

| 状態       | 説明                                        |
| -------- | ----------------------------------------- |
| 通常       | 通常入力、ユニット/補助テキストあり                        |
| クリアボタンあり | 入力済みかつ `clearButton=true` のとき × ボタンが表示される |
| 無効状態     | `disabled=true` の場合、背景色・文字色が灰色系に変更される     |
| エラー状態    | `error=true` の場合、赤枠＋補助文も赤くなる              |

---

## ✅ スタイル仕様

* `width`: `500px` 固定（カスタム可能）
* `fontSize`: `16px`
* `padding`: `8px`
* `disabled 背景色`: `#f0f0f0`
* `ユニット表示`: 右端に薄いグレー文字＋間隔あり（`4px`）

---

## 🧪 Storybook サンプル

以下のように Storybook での確認が可能です：

```tsx
<AutoResizingTextBox
  name="test"
  value="これはテストです"
  onChange={...}
  unit="文字"
  clearButton
  maxLength={100}
/>
```

* **複数バリエーション**（初期値あり・エラーあり・クリアボタンなど）を `Story` にて確認可能。

---

## ✏️ 備考

* 本コンポーネントは Material UI の `TextField` をベースに構築されており、基本機能に加え、UI/UX強化用のアドオンオプションを包括しています。
* 将来的に `resize` や `maxRows` 対応などの拡張も容易に可能です。


\n\n---\n\n## 差分反映: 2025-07-01 AutoResizingTextBox\n\n# 📘 AutoResizingTextBox 仕様書

## 🧩 概要

`AutoResizingTextBox` は、テキストの内容に応じて高さが変化し、必要に応じて単位表示・クリアボタンなどの UI 拡張が可能な**多機能テキストエリアコンポーネント**です。

* **自動高さ調整（minRows 単位）**
* **最大文字数制限**
* **単位ラベル表示（右側）**
* **クリアボタン表示・制御**
* **disabled 時のスタイル最適化**

---

## 🛠 使用方法

```tsx
<AutoResizingTextBox
  name="memo"
  value={memoText}
  onChange={(e) => setMemoText(e.target.value)}
  maxLength={100}
  unit="文字"
  clearButton
  helperText="最大100文字"
  error={hasError}
  disabled={isDisabled}
/>
```

---

## 💡 Props 詳細

| Prop名                | 型                                                  | 必須 | 説明                                   |
| -------------------- | -------------------------------------------------- | -- | ------------------------------------ |
| `name`               | `string`                                           | ✅  | フィールド名                               |
| `id`                 | `string`                                           |    | DOM用のID指定（任意）                        |
| `value`              | `string`                                           |    | テキストの値（controlled）                   |
| `onChange`           | `(e: React.ChangeEvent<HTMLInputElement>) => void` |    | 値変更ハンドラ                              |
| `onBlur`             | `(e: FocusEvent<HTMLInputElement>) => void`        |    | フォーカス離脱時のハンドラ                        |
| `disabled`           | `boolean`                                          |    | 入力不可状態を制御（背景色変化含む）                   |
| `maxLength`          | `number`                                           |    | 入力最大文字数を制限                           |
| `unit`               | `string`                                           |    | テキストボックス右端に表示される単位（例: `"文字"`, `"円"`） |
| `helperText`         | `string`                                           |    | 下部に表示される補足テキスト                       |
| `error`              | `boolean`                                          |    | エラーステータスの制御（赤枠など）                    |
| `customStyle`        | `object`                                           |    | カスタムスタイル（MUI sx に準ずる）                |
| `clearButton`        | `boolean`                                          |    | 右端にクリアボタン（×）を表示                      |
| `clearButtonOnClick` | `() => void`                                       |    | クリアボタン押下時のハンドラ（省略時は空文字で onChange）    |
| `minRows`            | `number`                                           |    | テキストエリアの最小行数（デフォルト: `1`）             |

---

## 🎨 UI 表示例

| 状態       | 説明                                        |
| -------- | ----------------------------------------- |
| 通常       | 通常入力、ユニット/補助テキストあり                        |
| クリアボタンあり | 入力済みかつ `clearButton=true` のとき × ボタンが表示される |
| 無効状態     | `disabled=true` の場合、背景色・文字色が灰色系に変更される     |
| エラー状態    | `error=true` の場合、赤枠＋補助文も赤くなる              |

---

## ✅ スタイル仕様

* `width`: `500px` 固定（カスタム可能）
* `fontSize`: `16px`
* `padding`: `8px`
* `disabled 背景色`: `#f0f0f0`
* `ユニット表示`: 右端に薄いグレー文字＋間隔あり（`4px`）

---

## 🧪 Storybook サンプル

以下のように Storybook での確認が可能です：

```tsx
<AutoResizingTextBox
  name="test"
  value="これはテストです"
  onChange={...}
  unit="文字"
  clearButton
  maxLength={100}
/>
```

* **複数バリエーション**（初期値あり・エラーあり・クリアボタンなど）を `Story` にて確認可能。

---

## ✏️ 備考

* 本コンポーネントは Material UI の `TextField` をベースに構築されており、基本機能に加え、UI/UX強化用のアドオンオプションを包括しています。
* 将来的に `resize` や `maxRows` 対応などの拡張も容易に可能です。


