// components/composite/header/Header.lang.ts
export const headerLang: HeaderLangs = {
    ja: {
      title: "関東スポーツクラブ",
      defaultUserName: "JEMS 太郎",
      logoUrl: "/Logo.png",
      logoHeight: "40px",
      iconMarginRight: "8px",
    },
    en: {
      title: "Common Architecture Sample App",
      defaultUserName: "JEMS Taro",
      logoUrl: "/Logo.png",
      logoHeight: "40px",
      iconMarginRight: "8px",
    },
  };

/**
 * Headerコンポーネントの言語設定
 */
export type HeaderLangs = {
  /**
   * 日本語
   *
   * @type {HeaderLang}
   */
  ja: HeaderLang;
  /**
   * 英語
   *
   * @type {HeaderLang}
   */
  en: HeaderLang;
};

/**
 * Headerコンポーネントの言語設定
 */
export type HeaderLang = {
  /**
   * タイトル
   *
   * @type {string}
   */
  title: string;
  /**
   * ユーザー名
   *
   * @type {string}
   */
  defaultUserName: string;
  /**
   * ロゴURL
   *
   * @type {string}
   */
  logoUrl: string;
  /**
   * ロゴの高さ
   *
   * @type {string}
   */
  logoHeight:string;
  /**
   * アイコンの右マージン
   *
   * @type {string}
   */
  iconMarginRight:string;
};
