// components/composite/Footer/Footer.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Footer from './Footer';
import { footerLang } from '@/components/composite/Footer/footer.lang';

// ダミーの言語設定データ
const defaultLanguage = footerLang.ja;

// const englishLanguage = footerLang.en;

// Storybookのメタ情報
const meta: Meta<typeof Footer> = {
  title: 'Common-architecture/Footer',
  component: Footer,
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
    onClick: action('onClick'),
  },
  // 各プロパティの説明と制御方法
  argTypes: {
    language: {
      description: '言語設定オブジェクト',
      control: 'object',
    },
    onClick: {
      description: 'フッターがクリックされたときのコールバック関数',
      action: 'onClick',
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof Footer>;

// デフォルトの表示
export const Default: Story = {};
