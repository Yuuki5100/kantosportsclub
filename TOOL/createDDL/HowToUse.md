## テーブルDDL一括生成ツール　概要と使い方

### 📖 概要

Excelで管理している「テーブル定義書」をもとに、データベースの作成（DROP／CREATE）に必要なSQLファイルを自動で作成する一連のプログラムです。

* **00\_run\_createDDL.js**：全体の実行をまとめるメインスクリプト&#x20;
* **01\_excel\_to\_csv.js**：Excelから「テーブル一覧」をCSVに変換&#x20;
* **02\_split\_excel\_by\_id.js**：Excelの「項目一覧」をテーブルごとに分割しCSVを出力&#x20;
* **03\_generate\_create\_table.js**：生成されたCSVを読み込み、最終的なDDL（SQL）を作成&#x20;

---

### 🛠️ 事前準備

1. **Node.js** がインストールされていることを確認してください。
2. プログラム一式（`00_run_createDDL.js`, `01_excel_to_csv.js`, `02_split_excel_by_id.js`, `03_generate_create_table.js`）を同じフォルダに用意。
3. Excelファイル（例：`UI07_テーブルファイル定義書 （100_入出庫予約管理）.v2.xlsx`）を用意し、**00\_run\_createDDL.js** 内のパスを正しいファイル名に書き換えてください。
4. 必要なパッケージのインストール
必要なNode.jsパッケージをインストールしてください。  
ターミナル（コマンドプロンプト等）で、スクリプトがあるフォルダに移動したあとに以下を実行します。
```bash
npm install xlsx csv-parser
---

### ▶ 実行手順

ターミナル（コマンドプロンプト）でスクリプトのあるフォルダへ移動し、以下を実行するだけです:

```bash
node 00_run_createDDL.js
```

1. **テーブル一覧CSV作成**

   * Excel「テーブル一覧」シートを読み込み
   * `output.csv` を出力
2. **項目一覧CSV分割**

   * Excel「項目一覧」シートを読み込み
   * テーブルIDごとに `CSV/` フォルダ内へCSV出力
3. **DDL（SQL）生成**

   * `output.csv` と `CSV/` フォルダを元に
   * まとめてテーブルをDROP → CREATE文 → インデックス → 外部キー を記述した
   * `create_all_tables.sql` を出力
4. 完了メッセージが表示されれば成功です！

---

### 🔍 各スクリプトの役割

#### 00\_run\_createDDL.js

* Excelファイルのパスを設定し、順番に３つのスクリプトを実行
* 実行状況をコンソールに表示&#x20;

#### 01\_excel\_to\_csv.js

* シート名：**テーブル一覧**
* A～D列を読み込み、不要行を除去
* `output.csv` に保存&#x20;

#### 02\_split\_excel\_by\_id.js

* シート名：**項目一覧**
* 必要な列を抽出し、D列のテーブルIDごとにまとめる
* フォルダ `CSV/` 内に `番号_テーブル名.csv` 形式でファイルを作成&#x20;

#### 03\_generate\_create\_table.js

* `output.csv` と `CSV/` 内のファイルを読み込み
* テーブル名・コメント登録 → カラム定義→PK/UNIQUE/INDEX→外部キー
* 最初にまとめてDROP、その後CREATE文などを `create_all_tables.sql` に出力&#x20;

---

### 📂 出力ファイル一覧

* **output.csv**
  テーブル一覧のCSV
* **CSV/**
  各テーブルごとの項目定義CSV（例：`001_入出庫予約.csv`）
* **create\_all\_tables.sql**
  DROP → CREATE → INDEX → FOREIGN KEY 一式が書かれたDDL

---

### ⚠️ 注意事項

* Excelシート名や列の配置が変わった場合は、各スクリプト内の設定（シート名や列番号）を併せて修正してください。
* エラーが出た場合は、ターミナルに表示されるメッセージを確認し、ファイル名やディレクトリ構成を見直してください。

