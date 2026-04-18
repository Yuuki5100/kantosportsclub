CREATE TABLE endpoint_authority_mapping (
  url VARCHAR(100) NOT NULL COMMENT 'エンドポイントURL',
  method VARCHAR(6) NOT NULL COMMENT 'HTTPメソッド',
  menu_function_id BIGINT NOT NULL COMMENT 'メニュー機能ID',
  required_level INT NOT NULL COMMENT 'このエンドポイントに必要な権限レベル',
  PRIMARY KEY (url, method),
  CONSTRAINT fk_endpoint_menu_function FOREIGN KEY (menu_function_id)
    REFERENCES master_menu_function(id)
)
