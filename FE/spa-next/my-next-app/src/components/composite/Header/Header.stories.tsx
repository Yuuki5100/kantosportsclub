// components/composite/Header/Header.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Header from './Header';
import { HeaderLang } from '@/components/composite/Header/header.lang';

// ダミーの言語設定データ
const defaultLanguage: HeaderLang = {
  title: '共通アーキテクチャ　動作確認App',
  defaultUserName: 'JEMS 太郎',
  logoUrl: 'https://www.j-ems.jp/recruit/wp-content/uploads/2022/02/JEMS_logo03_b_4c.png',
  logoHeight: '40px',
  iconMarginRight: '8px',
};

const englishLanguage: HeaderLang = {
  title: 'Common Architecture Sample App',
  defaultUserName: 'JEMS Taro',
  logoUrl: 'https://www.j-ems.jp/recruit/wp-content/uploads/2022/02/JEMS_logo03_b_4c.png',
  logoHeight: '40px',
  iconMarginRight: '8px',
};

// Storybookのメタ情報
const meta: Meta<typeof Header> = {
  title: 'Common-architecture/Header',
  component: Header,
  parameters: {
    // layout: 'fullscreen',
    docs: {
      description: {
        component: 'アプリケーション全体で使用されるグローバルヘッダーコンポーネントです。ロゴ、タイトル、ユーザー情報を表示します。',
      },
      story: {
        inline: true, // インラインでストーリーを表示
        iframeHeight: 400, // iframeの高さを指定
      },
      // canvas: { sourceState: 'shown' }, // ソースコードを表示
    },
  },
  tags: ['autodocs'],
  // デフォルトのprops
  args: {
    language: defaultLanguage,
    onLogoClick: action('onLogoClick'),
    onSettingsClick: action('onSettingsClick'),
  },
  // 各プロパティの説明と制御方法
  argTypes: {
    title: {
      description: 'ヘッダーに表示するタイトル。指定しない場合は言語設定のデフォルトタイトルが使用されます',
      control: 'text',
    },
    userName: {
      description: 'ヘッダーに表示するユーザー名。指定しない場合は言語設定のデフォルトユーザー名が使用されます',
      control: 'text',
    },
    onSettingsClick: {
      description: '設定ボタンがクリックされたときのコールバック関数',
      action: 'onSettingsClick',
    },
    onLogoClick: {
      description: 'ロゴがクリックされたときのコールバック関数',
      action: 'onLogoClick',
    },
    language: {
      description: '言語設定オブジェクト',
      control: 'object',
    },
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof Header>;

// デフォルトの表示
export const Default: Story = {};

// カスタムタイトルを指定したケース
export const WithCustomTitle: Story = {
  args: {
    title: 'カスタムタイトル',
  },
};

// カスタムユーザー名を指定したケース
export const WithCustomUser: Story = {
  args: {
    userName: '山田 太郎',
  },
};

// 英語版の表示
export const EnglishVersion: Story = {
  args: {
    language: englishLanguage,
  },
  parameters: {
    docs: {
      description: {
        story: '英語設定でのヘッダー表示例です。',
      },
    },
  },
};

// すべてのプロパティをカスタマイズしたケース
export const FullyCustomized: Story = {
  args: {
    title: 'プロジェクトダッシュボード',
    userName: '鈴木 一郎',
    language: {
      ...defaultLanguage,
      logoUrl: 'https://placehold.co/200x50/1976d2/FFFFFF/png?text=MyApp',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'すべてのカスタマイズオプションを適用したヘッダーの例です。',
      },
    },
  },
};
