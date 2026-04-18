# 📘 基盤モジュール使用マトリクス生成スクリプト仕様書

## 🎯 目的

`src/` 配下の各モジュール使用状況を横断的に分析し、**CSV → 論理グループ化 → HTML可視化** までを自動化するスクリプト一式を提供。

`analysis/` には、スクリプトで再生成できる分析生成物と、運用のために残す文書・マッピング資材が混在するため、本書では両者の役割もあわせて整理する。

---

## 📁 ディレクトリ構成（該当スクリプト）

```
FE/spa-next/my-next-app/
├── scripts/
│   ├── list-base-modules.ts         # 基盤モジュール一覧を走査して出力
│   ├── extractNamingMapper.ts        # 静的解析による logical-map.json 生成
│   ├── getNamingMapper.ts            # 実行時評価による logical-map.json 生成（代替手段）
│   ├── analyzeUsage.ts               # usage-matrix.csv / unused-base-modules.txt 生成
│   ├── convertCsv.ts                 # usage-matrix.csv → グルーピング付き CSV に変換
│   └── csvToHtml.ts                  # grouped.csv → HTML可視化
├── analysis/
│   ├── howToUse.md                  # 運用手順と保存方針
│   ├── screenMap.json               # 手動管理の画面名マッピング
│   ├── base-modules.json            # analyzeUsage の入力になる基盤モジュール一覧
│   ├── usage-matrix.csv             # analyzeUsage で作成
│   ├── unused-base-modules.txt      # analyzeUsage で作成
│   ├── logical-map.json             # resourceKey → 論理名マップ
│   ├── usage-matrix.grouped.csv     # グループ付きCSV（## でセクション分割）
│   └── usage-matrix.html            # 最終HTML（フィルター、ハイライト等付き）
```

---

## 📦 `analysis/` の保存方針

| 区分 | ファイル | 扱い |
| --- | --- | --- |
| 運用資材 | `analysis/howToUse.md` | 手順と保存方針の正本として継続保存 |
| 運用資材 | `analysis/screenMap.json` | リポジトリ内に生成経路がないため手動管理資材として保存 |
| 生成物 | `analysis/base-modules.json` | `list-base-modules.ts` から再生成 |
| 生成物 | `analysis/usage-matrix.csv` | `analyzeUsage.ts` から再生成 |
| 生成物 | `analysis/unused-base-modules.txt` | `analyzeUsage.ts` から再生成 |
| 生成物 | `analysis/logical-map.json` | `extractNamingMapper.ts` / `getNamingMapper.ts` から再生成 |
| 生成物 | `analysis/usage-matrix.grouped.csv` | `convertCsv.ts` から再生成 |
| 生成物 | `analysis/usage-matrix.html` | `csvToHtml.ts` から再生成 |

### 判断基準

* 手修正なしで再生成できるものは生成物として扱う
* 手順書や手動メンテナンス前提のマッピングは運用資材として扱う
* 生成物を保存する場合も、正本はスクリプトと入力ソース側にあるものとみなす

---

## 🧩 各スクリプト仕様

### ① `list-base-modules.ts`

| 項目       | 内容                                                          |
| -------- | ----------------------------------------------------------- |
| 📄 目的    | 共通モジュール一覧を走査し、後続分析の入力データを作る |
| 📥 入力    | `src/hooks`, `src/utils`, `src/api`, `src/components/**` など |
| 📤 出力    | `analysis/base-modules.json`                                |
| ▶ 実行コマンド | `node --loader ts-node/esm scripts/list-base-modules.ts`    |

---

### ② `analyzeUsage.ts`

| 項目       | 内容                                                                 |
| -------- | ------------------------------------------------------------------ |
| 📄 目的    | 各ページ・コンポーネントが共通モジュールを利用しているかを分析 |
| 📥 入力    | `analysis/base-modules.json`, `src/pages/**`, `src/components/**`  |
| 📤 出力    | `analysis/usage-matrix.csv`, `analysis/unused-base-modules.txt`    |
| ▶ 実行コマンド | `node --loader ts-node/esm scripts/analyzeUsage.ts`                |

---

### ③ `extractNamingMapper.ts`（or `getNamingMapper.ts`）

| 項目       | 内容                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| 📄 目的    | `PageConfig.tsx` の `resourceKey` を静的に解析して論理名マッピングを構築                                                                       |
| 📥 入力    | `src/config/PageConfig.tsx`（TSまたはTSX構文）                                                                                    |
| 📤 出力    | `analysis/logical-map.json`（例: `"src/pages/user"` → `"ユーザー管理"`）                                                            |
| 🔧 補足    | JSX内に `resourceKey` がある場合は `getNamingMapper.ts` の使用を検討                                                                     |
| ▶ 実行コマンド | `node --loader ts-node/esm scripts/extractNamingMapper.ts`<br>or<br>`node --loader ts-node/esm scripts/getNamingMapper.ts` |

---

### ④ `convertCsv.ts`

| 項目       | 内容                                                             |
| -------- | -------------------------------------------------------------- |
| 📄 目的    | `usage-matrix.csv` を論理グループごとにセクション分割（`## グループ名`）して出力           |
| 📥 入力    | `analysis/usage-matrix.csv`, `analysis/logical-map.json`       |
| 📤 出力    | `analysis/usage-matrix.grouped.csv`（セクションタイトル行入り）              |
| 🧠 ロジック  | - `logical-map.json` に基づいて各行にグループ名を付与<br>- グループごとにブロック分けして並べ替え |
| ▶ 実行コマンド | `node --loader ts-node/esm scripts/convertCsv.ts`              |

---

### ⑤ `csvToHtml.ts`

| 項目       | 内容                                                                                 |
| -------- | ---------------------------------------------------------------------------------- |
| 📄 目的    | `usage-matrix.grouped.csv` を元に、**視覚的にグループ分けされたHTMLマトリクス**を出力                       |
| 📥 入力    | `analysis/usage-matrix.grouped.csv`                                                |
| 📤 出力    | `analysis/usage-matrix.html`                                                       |
| 🧠 表示特徴  | - `## グループ名` 行 → セクションタイトル<br>- 行ハイライト → その列の ✅ 列を強調表示<br>- 未使用列除外フィルタ、グループ別フィルタ付き |
| ▶ 実行コマンド | `node --loader ts-node/esm scripts/csvToHtml.ts`                                   |

---

## ✅ 実行順序まとめ

| ステップ | スクリプト                                            | 目的                               |
| ---- | ------------------------------------------------ | -------------------------------- |
| 1️⃣  | `list-base-modules.ts`                           | base-modules.json 生成             |
| 2️⃣  | `analyzeUsage.ts`                                | usage-matrix.csv / 未使用一覧を生成      |
| 3️⃣  | `extractNamingMapper.ts` or `getNamingMapper.ts` | logical-map.json 生成              |
| 4️⃣  | `convertCsv.ts`                                  | usage-matrix.csv をグルーピング付きCSVへ変換 |
| 5️⃣  | `csvToHtml.ts`                                   | grouped.csv をHTML形式に変換           |

---

## 📝 補足仕様

* `## xxx` 行は `<tbody>` のセクション切り替え要素として認識
* 左列の `"src/xxx"` 表記は **クリックで行ハイライト切り替え可能**
* 論理名 `"ユーザー管理"` などは `logical-map.json` から変換されて表示（convert時点）
* 未使用列（すべて ❌）は⚠マーク付き・フィルタで除外可能
* グループ名・論理名は `src/pages/**` 形式で照合し、最上位ディレクトリで分類

---

## 🧪 サンプル出力イメージ

```
## ユーザー管理
src/pages/user/index.tsx, ✅, ❌, ...
src/pages/user/profile.tsx, ❌, ✅, ...

## 設定
src/pages/settings/index.tsx, ✅, ✅, ...
```

→ HTMLでは各 `##` ごとに **テーブルセクション** としてレンダリングされる。
