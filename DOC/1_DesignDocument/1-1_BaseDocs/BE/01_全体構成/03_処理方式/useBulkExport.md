# 📘 帳票DB設定ガイド（1帳票＝1シート／複数シート統合対応）

## ✅ 目的
1帳票を1シートとして出力し、複数帳票をまとめて1つのExcelファイルに結合する場合の
`report_master` / `report_layout` 設定方針を整理する。

---

## 📁 1. `report_master` の定義とサンプル

### 📌 テーブル概要

| カラム名 | 内容 |
| --- | --- |
| `report_id` | 一意な帳票ID（PK） |
| `report_name` | シート名として利用される帳票表示名 |
| `template_file` | テンプレートファイルパス |
| `output_format` | 出力形式（`1=PDF`, `2=Excel`） |
| `description` | 補足説明（任意） |
| `updated_at` | 更新日時 |
| `updated_by` | 更新者 |

### 🧪 サンプルデータ

```sql
INSERT INTO report_master (
    report_id, report_name, template_file, output_format,
    description, updated_at, updated_by
) VALUES
(101, 'ユーザー一覧', 'templates/user-list.xlsx', 2, 'ユーザー情報を出力', NOW(), 'admin'),
(102, '注文履歴',   'templates/order-history.xlsx', 2, '注文履歴の出力', NOW(), 'admin');
```

---

## 📁 2. `report_layout` の定義とサンプル

### 📌 テーブル概要（実装準拠）

| カラム名 | 内容 |
| --- | --- |
| `report_id` | 帳票ID（外部キー） |
| `column_id` | 帳票内での一意なカラムID |
| `column_name` | DB上のカラム名（例: `username`） |
| `entity_name` | 取得元エンティティ名（任意） |
| `property_path` | プロパティパス（例: `user.name`） |
| `display_label` | 出力時の列ラベル |
| `data_type` | データ型（ReportDataType: 1=STRING, 2=NUMBER, 3=DATE, 4=BOOLEAN, 5=CURRENCY, 9=CUSTOM） |
| `display_order` | 出力順 |
| `visible_flag` | 表示/非表示（1=表示） |
| `format_pattern` | 表示フォーマット（任意） |
| `required_flag` | 必須（1=必須） |
| `default_value` | 初期値（任意） |
| `remarks` | 備考（任意） |
| `updated_at` | 更新日時 |
| `updated_by` | 更新者 |

### 🧪 サンプルデータ（ユーザー一覧）

```sql
INSERT INTO report_layout (
    report_id, column_id, column_name, entity_name, property_path, display_label,
    data_type, display_order, visible_flag, format_pattern,
    required_flag, default_value, remarks, updated_at, updated_by
) VALUES
(101, 1, 'username', 'User', 'user.name', 'ユーザー名', 1, 1, 1, NULL, 1, NULL, NULL, NOW(), 'admin'),
(101, 2, 'email',    'User', 'user.email','メールアドレス', 1, 2, 1, NULL, 1, NULL, NULL, NOW(), 'admin'),
(101, 3, 'role',     'User', 'user.role', '権限', 1, 3, 1, NULL, 1, NULL, NULL, NOW(), 'admin');
```

---

## 🧩 帳票出力時の動作イメージ

| report_id | 出力対象 | 使用テンプレート | Excelシート名 |
| --- | --- | --- | --- |
| 101 | users | `user-list.xlsx` | ユーザー一覧 |
| 102 | orders | `order-history.xlsx` | 注文履歴 |

これらを `BulkExportRequest` にて一括指定すれば、
「ユーザー一覧」「注文履歴」の2シートを持つExcelファイルが生成される。

---

## 📦 設定のポイント

| 設定対象 | ポイント |
| --- | --- |
| `report_master` | 帳票ID・テンプレート・出力形式・表示名（＝シート名）を定義する |
| `report_layout` | 各帳票に出力すべきカラムを定義する |
| Excelテンプレート | 各帳票用に1シートだけを持つテンプレートファイルを作成し、Storage に配置する |
| BulkExportRequest | `reportIds = [101, 102]` のように指定して複数帳票を統合する |

---

## 参照・補足

- `template_file` は **StorageService が解釈するパス**として扱う。
  - S3: `storage.s3.template-prefix` が未設定の場合、`templates/export/excel` を先頭に付与する。
  - Local: `storage.local.template-dir` を基点に解決する。

## 要確認

- 旧資料に記載されていた `table_name` は `ReportLayout` に存在しないため要確認。
