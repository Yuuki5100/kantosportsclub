CREATE TABLE IF NOT EXISTS mail_templates (
  locale VARCHAR(10) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  PRIMARY KEY (locale, template_name)
);
