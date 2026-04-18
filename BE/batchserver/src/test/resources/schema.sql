CREATE TABLE IF NOT EXISTS mail_templates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  locale VARCHAR(10) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  subject TEXT,
  body TEXT
);


-- 存在しなければ INSERT する（H2対応版）
INSERT INTO mail_templates (locale, template_name, subject, body)
SELECT 'ja', 'user_welcome', 'ようこそ、{{username}}さん', 'こんにちは、{{username}}さん。JEMSサービスへようこそ！'
WHERE NOT EXISTS (
  SELECT 1 FROM mail_templates WHERE locale = 'ja' AND template_name = 'user_welcome'
);

INSERT INTO mail_templates (locale, template_name, subject, body)
SELECT 'en', 'user_welcome', 'Welcome, {{username}}', 'Hello {{username}}, welcome to the JEMS service!'
WHERE NOT EXISTS (
  SELECT 1 FROM mail_templates WHERE locale = 'en' AND template_name = 'user_welcome'
);
