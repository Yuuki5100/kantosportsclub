import { describe, expect, it } from '@jest/globals';

import { resolvePageTitle } from '@/utils/pageTitle';

const appTitle = '共通基盤テンプレート';

const pageConfig = [
  {
    name: 'トップ',
    resourceKey: '/',
    requiredPermission: 0,
    langKey: 'top' as const,
  },
  {
    name: 'ユーザー管理',
    resourceKey: '/user',
    requiredPermission: 2,
    langKey: 'user' as const,
    children: [
      {
        name: 'ユーザー一覧',
        resourceKey: '/user/list',
        requiredPermission: 2,
        langKey: 'userList' as const,
      },
    ],
  },
];

const pageLabels = {
  top: 'トップ',
  user: 'ユーザー管理',
  userList: 'ユーザー一覧',
};

const publicPageTitles = {
  '/login': 'ログイン',
  '/reset-password/[token]': '新しいパスワード設定',
};

describe('resolvePageTitle', () => {
  it('PageConfig に定義された画面のタイトルを解決する', () => {
    expect(
      resolvePageTitle({
        pathname: '/user/list',
        appTitle,
        pageConfig,
        pageLabels,
        publicPageTitles,
      })
    ).toBe('ユーザー一覧 | 共通基盤テンプレート');
  });

  it('公開画面は専用タイトルを優先する', () => {
    expect(
      resolvePageTitle({
        pathname: '/login',
        appTitle,
        pageConfig,
        pageLabels,
        publicPageTitles,
      })
    ).toBe('ログイン | 共通基盤テンプレート');
  });

  it('該当画面がない場合は共通タイトルを返す', () => {
    expect(
      resolvePageTitle({
        pathname: '/unknown',
        appTitle,
        pageConfig,
        pageLabels,
        publicPageTitles,
      })
    ).toBe(appTitle);
  });
});
