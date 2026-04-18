CREATE TABLE mail_templates (
    locale VARCHAR(10) NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    subject TEXT,
    body TEXT,
    PRIMARY KEY (locale, template_name)
);

-- テスト用テンプレートデータの挿入
INSERT INTO mail_templates (locale, template_name, subject, body) VALUES
('ja', 'user_welcome', 'ようこそ、{{username}}さん', 'こんにちは、{{username}}さん。JEMSサービスへようこそ！'),
('en', 'user_welcome', 'Welcome, {{username}}', 'Hello {{username}}, welcome to the JEMS service!');
