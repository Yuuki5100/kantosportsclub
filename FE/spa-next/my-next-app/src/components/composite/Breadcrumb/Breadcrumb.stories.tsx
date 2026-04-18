import { Meta, StoryObj } from '@storybook/react';
import Breadcrumb from './Breadcrumb';
import { getPageConfig } from '@/config/PageConfig';
import { pageLang } from '@/config/PageLang';

// モック関数
const handleLinkClick = (path: string) => {
  console.log(`リンククリック: ${path}`);
};

// Metaデータの定義
const meta: Meta<typeof Breadcrumb> = {
  title: 'Common-Architecture/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'パンくずリストコンポーネント。現在のページ階層を表示し、ナビゲーションを提供します。',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

// 共通のprops
const commonProps = {
  pageConfigType: getPageConfig(),
  language: pageLang.ja,
  onLinkClick: handleLinkClick,
};

// ストーリー定義
export const Home: Story = {
  args: {
    ...commonProps,
    currentPath: '/',
  },
  parameters: {
    docs: {
      description: {
        story: 'ホーム画面のパンくずリスト。最も上位の階層のため、リンクは表示されません。',
      },
    },
  },
};

export const Dashboard: Story = {
  args: {
    ...commonProps,
    currentPath: '/dashboard',
  },
  parameters: {
    docs: {
      description: {
        story: 'ダッシュボード画面のパンくずリスト。ホームへのリンクが含まれます。',
      },
    },
  },
};

export const UserManagement: Story = {
  args: {
    ...commonProps,
    currentPath: '/user',
  },
  parameters: {
    docs: {
      description: {
        story: 'ユーザー管理画面のパンくずリスト。ダッシュボードとホームへのリンクが含まれます。',
      },
    },
  },
};

export const UserList: Story = {
  args: {
    ...commonProps,
    currentPath: '/user/list',
  },
  parameters: {
    docs: {
      description: {
        story: 'ユーザー一覧画面のパンくずリスト。ユーザー管理、ダッシュボード、ホームへのリンクが含まれます。',
      },
    },
  },
};

export const Settings: Story = {
  args: {
    ...commonProps,
    currentPath: '/settings',
  },
  parameters: {
    docs: {
      description: {
        story: '設定画面のパンくずリスト。ダッシュボードとホームへのリンクが含まれます。',
      },
    },
  },
};
