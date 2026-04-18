## 📁 `analysis/` の位置づけと保存方針

`analysis/` は、フロントエンド構成の分析に使う**運用資材**と、スクリプトから再生成できる**分析生成物**をまとめて置くディレクトリです。

| 区分 | ファイル | 保存方針 |
| --- | --- | --- |
| 運用資材 | `analysis/howToUse.md` | 手順書として継続保存し、運用変更時に更新する |
| 運用資材 | `analysis/screenMap.json` | 現状はリポジトリ内に生成経路がないため、手動管理のマッピング資材として扱う |
| 生成物 | `analysis/base-modules.json` | `scripts/list-base-modules.ts` で再生成する |
| 生成物 | `analysis/usage-matrix.csv` | `scripts/analyzeUsage.ts` で再生成する |
| 生成物 | `analysis/unused-base-modules.txt` | `scripts/analyzeUsage.ts` で再生成する |
| 生成物 | `analysis/logical-map.json` | `scripts/extractNamingMapper.ts` または `scripts/getNamingMapper.ts` で再生成する |
| 生成物 | `analysis/usage-matrix.grouped.csv` | `scripts/convertCsv.ts` で再生成する |
| 生成物 | `analysis/usage-matrix.html` | `scripts/csvToHtml.ts` で再生成する |

### 判断基準

* スクリプト実行だけで再現でき、手修正を前提にしないものは**生成物**として扱う
* 手順・判断基準・手動メンテナンス前提のマッピングのように、再生成できないものは**運用資材**として扱う
* 生成物はレビューや共有のために一時的にコミットされることはあっても、内容の正本はスクリプトと入力ソース側にある

---

## 🔁 モジュール構成の更新（develop-jems ブランチ）

新しく共通モジュール（hooks, utils, api, base component など）を追加した場合、以下のコマンドで **`base-modules.json`** を再生成してください。

```bash
node --loader ts-node/esm scripts/list-base-modules.ts
```

> 📄 出力先: `analysis/base-modules.json`

---

## 📊 使用状況の分析と可視化（develop ブランチ）

### 1. 使用状況の分析（CSV出力）

```bash
node --loader ts-node/esm scripts/analyzeUsage.ts
```

* 各ページ・コンポーネントにおける共通モジュールの使用有無をマトリクスとして分析します。
* 使用されていないモジュール一覧も `unused-base-modules.txt` に出力されます。

> 📄 出力ファイル:
>
> * `analysis/usage-matrix.csv`
> * `analysis/unused-base-modules.txt`

---

### 2. 論理グループ付き CSV の作成

```bash
node --loader ts-node/esm scripts/extractNamingMapper.ts
node --loader ts-node/esm scripts/convertCsv.ts
```

* `PageConfig.tsx` から論理名マップを生成し、`usage-matrix.csv` をグループ別に再構成します。
* JSX 解析の都合で `extractNamingMapper.ts` では不足する場合は、`getNamingMapper.ts` を代替で使用します。

> 📄 出力ファイル:
>
> * `analysis/logical-map.json`
> * `analysis/usage-matrix.grouped.csv`

---

### 3. 閲覧用 HTML の作成

```bash
node --loader ts-node/esm scripts/csvToHtml.ts
```

* グループ化済み CSV を表形式で見やすい **HTML ファイル** に変換します。
* `analysis/usage-matrix.grouped.csv` が前提のため、先に Step 2 を実行してください。

> 📄 出力ファイル: `analysis/usage-matrix.html`

---

## 📁 出力ファイルの格納先一覧

| ファイル名                              | 説明                  |
| ---------------------------------- | ------------------- |
| `analysis/howToUse.md`             | `analysis/` 運用手順と保存方針 |
| `analysis/base-modules.json`       | 共通モジュール一覧（基盤スキャン結果） |
| `analysis/usage-matrix.csv`        | 使用状況マトリクス（CSV形式）    |
| `analysis/logical-map.json`        | 論理名マッピング            |
| `analysis/usage-matrix.grouped.csv`| グループ化済みマトリクス（CSV形式） |
| `analysis/usage-matrix.html`       | 使用状況マトリクス（HTML形式）   |
| `analysis/unused-base-modules.txt` | 使用されていないモジュール一覧     |
| `analysis/screenMap.json`          | 手動管理の画面名マッピング資材    |

---
