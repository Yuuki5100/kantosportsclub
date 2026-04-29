const getCurrentYear = (): number => new Date().getFullYear();

export const footerLang: FooterLangs = {
  ja: {
    title: 'ログインページ',
    description: 'ログイン画面の説明です。',
    usernamePlaceholder: 'ユーザー名',
    passwordPlaceholder: 'パスワード',
    loginButton: 'ログイン',
    loginError: 'ログインに失敗しました。',
    copyrightText: `©${getCurrentYear()} 関東スポーツクラブ Inc.`,
  },
  en: {
    title: 'Login Page',
    description: 'Description of the login screen.',
    usernamePlaceholder: 'Username',
    passwordPlaceholder: 'Password',
    loginButton: 'Login',
    loginError: 'Login failed.',
    copyrightText: `© ${getCurrentYear()} 関東スポーツクラブ Inc. All rights reserved.`,
  },
};

export type FooterLangs = {
  ja: FooterLang;
  en: FooterLang;
};

export type FooterLang = {
  title: string;
  description: string;
  usernamePlaceholder: string;
  passwordPlaceholder: string;
  loginButton: string;
  loginError: string;
  copyrightText: string;
};
