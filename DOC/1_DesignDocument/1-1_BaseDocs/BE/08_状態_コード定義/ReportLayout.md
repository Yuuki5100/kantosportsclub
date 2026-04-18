# ReportMaster / ReportLayout テーブル設計（実装準拠）

## 概要
帳票出力（Excel/PDF）で使用するレイアウト情報を DB で管理するためのテーブル設計です。
本資料は **エンティティ実装（ReportMaster / ReportLayout）に合わせて整理**しています。

---

## テーブル定義（実装準拠）

### report_master

- 実装: `ReportMaster`（`BE/servercommon/src/main/java/com/example/servercommon/model/ReportMaster.java`）

```sql
CREATE TABLE report_master (
    report_id        BIGINT        NOT NULL COMMENT '帳票ID（主キー）',
    report_name      VARCHAR(100)  NOT NULL COMMENT '帳票名（画面表示）',
    template_file    VARCHAR(255)  NOT NULL COMMENT 'テンプレートファイルパス',
    output_format    INT           NOT NULL COMMENT '出力形式（1=PDF, 2=EXCEL）',
    description      VARCHAR(500)           COMMENT '帳票説明',
    updated_at       DATETIME      NOT NULL COMMENT '更新日時',
    updated_by       VARCHAR(50)   NOT NULL COMMENT '更新者ID',
    PRIMARY KEY (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帳票マスタ';
```

### report_layout

- 実装: `ReportLayout`（`BE/servercommon/src/main/java/com/example/servercommon/model/ReportLayout.java`）

```sql
CREATE TABLE report_layout (
    report_id        BIGINT         NOT NULL COMMENT '帳票ID（FK）',
    column_id        INT            NOT NULL COMMENT '帳票列ID',
    column_name      VARCHAR(100)   NOT NULL COMMENT 'DBカラム名',
    entity_name      VARCHAR(100)            COMMENT '取得元エンティティ名',
    property_path    VARCHAR(200)            COMMENT 'プロパティパス（例: customer.name）',
    display_label    VARCHAR(100)   NOT NULL COMMENT '表示ラベル',
    data_type        INT            NOT NULL COMMENT 'データ型（ReportDataType）',
    display_order    INT            NOT NULL COMMENT '表示順',
    visible_flag     INT            NOT NULL COMMENT '表示フラグ（1=表示, 0=非表示）',
    format_pattern   VARCHAR(50)             COMMENT '表示フォーマット（例: yyyy/MM/dd, #,##0.00）',
    required_flag    INT            NOT NULL COMMENT '必須フラグ（1=必須, 0=任意）',
    default_value    VARCHAR(100)            COMMENT 'デフォルト値',
    remarks          VARCHAR(500)            COMMENT '備考',
    updated_at       DATETIME       NOT NULL COMMENT '更新日時',
    updated_by       VARCHAR(50)    NOT NULL COMMENT '更新者ID',
    PRIMARY KEY (report_id, column_id),
    CONSTRAINT fk_report_layout_master FOREIGN KEY (report_id)
        REFERENCES report_master (report_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帳票レイアウト';
```

---

## data_type の定義

- 実装: `ReportDataType`（`BE/servercommon/src/main/java/com/example/servercommon/enums/ReportDataType.java`）

| code | 名称 | 既定フォーマット |
| --- | --- | --- |
| 1 | STRING | `@` |
| 2 | NUMBER | `#,##0.###` |
| 3 | DATE | `yyyy/mm/dd` |
| 4 | BOOLEAN | `BOOLEAN` |
| 5 | CURRENCY | `"¥"#,##0` |
| 9 | CUSTOM | `null` |

---

## 要確認

- 旧資料に記載されていた `table_name` は `ReportLayout` に存在しないため要確認。

---

## 補足
- `format_pattern` は Excel 出力時の表示フォーマットに使用する。
