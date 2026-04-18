CREATE TABLE IF NOT EXISTS report_master (
    report_id        VARCHAR(50)   NOT NULL COMMENT '帳票ID（主キー）',
    report_name      VARCHAR(100)  NOT NULL COMMENT '帳票名',
    template_file    VARCHAR(255)  NOT NULL COMMENT 'テンプレートファイル名（S3上のパス）',
    output_format    INT           NOT NULL COMMENT '出力形式（1=PDF, 2=EXCEL）',
    description      VARCHAR(500)           COMMENT '帳票の説明や補足',
    updated_at       DATETIME      NOT NULL COMMENT '更新日時',
    updated_by       VARCHAR(50)   NOT NULL COMMENT '更新者ID',
    PRIMARY KEY (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帳票マスタ';

CREATE TABLE IF NOT EXISTS report_layout (
    report_id        VARCHAR(50)   NOT NULL COMMENT '帳票ID（外部キー）',
    column_id        VARCHAR(50)   NOT NULL COMMENT '帳票内での一意な項目識別子',
    column_name      VARCHAR(100)  NOT NULL COMMENT 'DBのカラム名',
    display_label    VARCHAR(100)  NOT NULL COMMENT '画面表示ラベル',
    data_type        INT           NOT NULL COMMENT 'データ型（1=文字列, 2=数値, 3=日付など）',
    display_order    INT           NOT NULL COMMENT '表示順序（昇順）',
    visible_flag     INT           NOT NULL COMMENT '表示フラグ（1=表示, 0=非表示）',
    format_pattern   VARCHAR(50)            COMMENT 'フォーマット指定（例：yyyy/MM/dd）',
    required_flag    INT           NOT NULL COMMENT '必須フラグ（1=必須, 0=任意）',
    default_value    VARCHAR(100)           COMMENT '初期値（省略可能）',
    remarks          VARCHAR(500)           COMMENT '備考',
    updated_at       DATETIME      NOT NULL COMMENT '更新日時',
    updated_by       VARCHAR(50)   NOT NULL COMMENT '更新者ID',
    PRIMARY KEY (report_id, column_id),
    CONSTRAINT fk_report_layout_master FOREIGN KEY (report_id)
        REFERENCES report_master (report_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帳票レイアウト';
