# フォームモジュール仕様書

## 1. モジュール概要

### 1-1. 目的
本モジュールは、ユーザーからの入力を受け付け、問題のないデータを収集するための UI コンポーネントを提供することを目的とします。

### 1-2. 適用範囲
- テキストボックス、チェックボックス、ラジオボタンなど、表示される入力フィールド系の全コンポーネント

---

## 2. 設計方針

### 2-1. 基本アーキテクチャ
- React のコンポーネントとして実装
- MUI (本システムでは Material-UI) をベースとした UI 構築
- ほとんどのコンポーネントに `customStyle` プロパティを持たせカスタマイズに対応

### 2-2. 統一ルール
- フォントサイズ、背景色、メッセージの色などを統一
- `disabled` プロパティを持ち、非活性的な表示スタイルも統一表示
- `helperText` によりユーザーへのサポート文字を表示
- `error` によりコンポーネントのエラー表示切替

---

## 3. コンポーネント種類

- **TextBox**: 単行のテキスト入力フィールド。カスタムスタイルや単位表示、クリアボタンの表示に対応。
  - **主な引数**:
    - `name`: 入力フィールドの名前（必須）
    - `type`: 入力タイプ（text, number, password など）
    - `defaultValue`: 初期値
    - `onChange`: 値変更時のイベントハンドラ
    - `disabled`: 入力無効化フラグ
    - `maxLength`: 入力可能な最大文字数
    - `unit`: 単位の表示（例: kg, %）
    - `error`: 補助テキストとコンポーネントのエラー表示切り替え
    - `helperText`: 補助テキストの表示
    - `customStyle`: MUI sx によるスタイル拡張
    - `clearButton`: クリアボタンの表示
  - **機能**: 入力文字の最大長制限、補助テキスト表示、無効化スタイル、単位表示、スタイルカスタマイズ

- **TextBoxMultiLine**: 複数行入力対応のテキストエリア。行数指定や文字数表示機能あり。
  - **主な引数**:
    - `name`: フィールド識別名
    - `value`: 入力の外部制御用の値（オプション）
    - `defaultValue`: 初期表示する文字列（任意）
    - `onChange`: 入力値が変更されたときのハンドラ関数
    - `maxLength`: 最大入力文字数（制限は実装者が任意に適用）
    - `disabled`: フィールドの無効化
    - `customStyle`: スタイルカスタマイズオブジェクト
    - `rows`: 表示する行数（デフォルト4行）
    - `error`: 補助テキストとコンポーネントのエラー表示切り替え
    - `helperText`: 補助テキストの表示
  - **機能**: 入力文字数カウント表示、行数設定、カスタム幅対応、スタイルカスタマイズ

- **RadioButton**: 単一選択のラジオボタン。列または行方向の切り替えに対応。
  - **主な引数**:
    - `name`: ラジオグループの識別子。
    - `id`: HTML DOM 上の識別子（省略可能）。
    - `options`: 選択肢の配列。各要素は `value`, `label`, `disabled` を含むオブジェクト。
    - `selectedValue`: 選択中の値。外部からの制御が可能。
    - `onChange`: 選択変更時に呼び出されるイベントハンドラ。
    - `disabled`: グループ全体の無効化制御。
    - `customStyle`: MUI sx によるカスタムスタイル。
    - `error`: 補助テキストとコンポーネントのエラー表示切り替え
    - `helperText`: 補助テキストの表示
    - `direction`: `row` または `column` による表示方向の切り替え。
    - `maxColumns`: 表示列数の最大数（`direction="row"` のときに使用）。
  - **機能**: オプションの無効化、列/行方向表示、補助テキスト表示、選択状態の外部制御

- **CheckBox**: 複数選択可能なチェックボックス。
  - **主な引数**:
    - `name`: コンポーネント識別名（必須）
    - `options`: 選択肢配列（各項目に `value`, `label`, `disabled` を含む）
    - `selectedValues`: 現在選択されている値の配列
    - `onChange`: 値変更時に呼び出す関数（選択値配列を引数に渡す）
    - `disabled`: コンポーネント全体を非活性にするかどうか
    - `customStyle`: MUI スタイルオブジェクトによるカスタマイズ
    - `error`: 補助テキストとコンポーネントのエラー表示切り替え
    - `helperText`: 補助テキストの表示
    - `direction`: 並び方向（row または column）
    - `maxColumns`: row 表示時の最大列数
  - **機能**: チェック状態の外部管理、複数列対応、オプション無効化、補助テキスト表示

- **DropBox**: 一覧から一つを選択するセレクト UI。
  - **主な引数**:
    - `name`: セレクトボックスの名前
    - `options`: 選択肢の配列（`value`, `label`, `disabled`）
    - `selectedValue`: 現在選択されている値（制御）
    - `onChange`: 選択変更時に発火するイベントハンドラ
    - `disabled`: 選択操作を無効にするかどうか
    - `customStyle`: コンポーネントに適用するカスタムスタイル
    - `error`: 補助テキストとコンポーネントのエラー表示切り替え
    - `helperText`: 補助テキストの表示
  - **機能**: アイコン付きセレクト、デフォルトと追加オプション統合、無効化対応

- **DropBoxMultiSelected**: 複数選択対応のセレクト UI。
  - **主な引数**:
    - `name`: コンポーネント識別名
    - `options`: 選択肢の配列（`value`, `label`, `disabled`,`selected`）
    - `onChange`: 選択変更時のイベントハンドラ（選択値配列を返す）
    - `disabled`: セレクトボックス全体の無効化制御
    - `customStyle`: MUI スタイルによるデザイン変更
    - `error`: 補助テキストとコンポーネントのエラー表示切り替え
    - `helperText`: 補助テキストの表示
  - **機能**: 複数選択、チェックマーク表示、カスタムオプション・スタイル対応

- **SelectBox**: リスト形式で選択するボックス。
  - **主な引数**:
    - `name`: 識別名（フォーム用）
    - `options`: 選択肢の配列（`value`, `label`, `disabled`）
    - `selectedValues`: 選択済み値（配列）
    - `onChange`: 選択状態変更時の関数（配列を渡す）
    - `disabled`: コンポーネント無効化設定
    - `customStyle`: MUI スタイルのカスタマイズ
    - `error`: 補助テキストとコンポーネントのエラー表示切り替え
    - `helperText`: 補助テキストの表示
    - `width`: 表示幅（px）
    - `height`: 最大表示高さ（px）
  - **機能**: 複数選択、スクロール対応、高さ/幅調整、選択状態の外部制御

- **AutoComplete**: テキスト入力と連動した候補選択型 UI。
  - **主な引数**:
    - `name`: コンポーネント識別名
    - `options`: 候補データ配列（`label`, `value`）
    - `defaultValue`: 初期選択される値（value）
    - `disabled`: 無効化状態設定
    - `error`: 補助テキストとコンポーネントのエラー表示切り替え
    - `helperText`: 補助テキストの表示
    - `onChange`: 選択変更時のハンドラ（選択候補を返却）
    - `customStyle`: 外観カスタマイズ用のスタイル指定
  - **機能**: 入力と連動した候補フィルタリング、補助/エラー表示、カスタムスタイル

- **AutoCompleteMultiSelected**: 複数値の候補選択型 UI。
  - **主な引数**:
    - `name`: 入力フィールドの識別子
    - `options`: 候補一覧（label と value を持つ）
    - `defaultValue`: 初期選択される value 配列
    - `disabled`: コンポーネントの無効化設定
    - `helperText`: 補助テキスト表示
    - `error`: 補助テキストとコンポーネントのエラー表示切り替え
    - `helperText`: 補助テキストの表示
    - `onChange`: 選択変更時の処理関数（選択されたオブジェクト配列を返却）
    - `customStyle`: 任意のスタイル指定
  - **機能**: 複数候補の自動補完、選択値の配列管理、スタイルカスタマイズ

---

## 4. バリデーション仕様

- **TextBox**: `maxLength` による文字数制限が可能。空入力の制御は外部で対応。
- **TextBoxMultiLine**: `maxLength` のカウント表示機能あり。実際の制限制御はなし（警告用として使用）。
- **RadioButton**: 選択必須チェックは外部で実装。コンポーネント内部では選択なし状態も許容。
- **CheckBox**: 必須チェックや選択上限数などの制御は外部実装により対応。
- **DropBox**: `selectedValue` の有無によって選択チェック。空選択を許容するかは実装側に依存。
- **DropBoxMultiSelected**: 複数選択のうち 0 件選択を許容するかは呼び出し元で制御。
- **SelectBox**: `selectedValues.length` を外部で評価して 1 件以上の選択を保証する必要がある。
- **AutoComplete**: `onChange` による選択検知。null 選択を許容するかは実装側で判断。
- **AutoCompleteMultiSelected**: 選択必須か任意かの判断は呼び出し元で制御。

※ バリデーションエラーメッセージの表示には `helperText` および`error` プロパティを使用することが想定されていますが、実際の判定ロジックは呼び出し元コンポーネントで制御する必要があります。

---

## 5. フォルダ構成

```plaintext
src/
└── components/
    └── input/
        ├── TextBox.tsx
        ├── TextBoxMultiLine.tsx
        ├── RadioButton.tsx
        ├── CheckBox.tsx
        ├── DropBox.tsx
        ├── DropBoxMultiSelected.tsx
        ├── SelectBox.tsx
        ├── AutoComplete.tsx
        └── AutoCompleteMultiSelected.tsx
```

