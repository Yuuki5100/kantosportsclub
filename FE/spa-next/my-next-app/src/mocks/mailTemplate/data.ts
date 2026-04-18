export type MockMailTemplate = {
  templateName: string;
  locale: string;
  subject: string;
  body: string;
};

export const mockMailTemplates: MockMailTemplate[] = [
  {
    templateName: "welcome",
    locale: "ja",
    subject: "ようこそ",
    body: "<p>ようこそ、{{name}}さん</p>",
  },
  {
    templateName: "reset-password",
    locale: "ja",
    subject: "パスワード再設定",
    body: "<p>以下のリンクから再設定してください。</p>",
  },
];

