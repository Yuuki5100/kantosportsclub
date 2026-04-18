import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useState, useEffect } from 'react';
import SnackbarNotification from './SnackbarNotification';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ButtonBase } from '../base/Button';
import snackbarSlice from '../../slices/snackbarSlice';

// Storybookでのテスト用ストア
const createTestStore = () => configureStore({
  reducer: {
    snackbar: snackbarSlice,
  },
});

// SnackbarNotificationをテストするためのラッパーコンポーネント
const SnackbarWrapper = ({ message, type }: { message?: string; type?: 'SUCCESS' | 'ERROR' | 'ALERT' | null }) => {
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (message && type) {
      showSnackbar(message, type);
    }
  }, [message, type, showSnackbar]);

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <div id="snackbar-root" />
      <SnackbarNotification />
    </div>
  );
};

// インタラクティブなテスト用コンポーネント
const InteractiveSnackbarDemo = () => {
  const { showSnackbar } = useSnackbar();
  
  return (
    <div style={{ position: 'relative', height: '100vh', padding: '20px' }}>
      <div id="snackbar-root" />
      <SnackbarNotification />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <h2>Snackbar Notification Demo</h2>
        <p>各ボタンをクリックして、異なるタイプのSnackbarを表示してください。</p>
        
        <ButtonBase
          label="成功メッセージを表示"
          onClick={() => showSnackbar('操作が正常に完了しました！', 'SUCCESS')}
          color="success"
        />
        
        <ButtonBase
          label="エラーメッセージを表示"
          onClick={() => showSnackbar('エラーが発生しました。もう一度お試しください。', 'ERROR')}
          color="error"
        />
        
        <ButtonBase
          label="警告メッセージを表示"
          onClick={() => showSnackbar('この操作には注意が必要です。', 'ALERT')}
          color="warning"
        />
        
        <ButtonBase
          label="長いメッセージを表示"
          onClick={() => showSnackbar(
            'これは非常に長いメッセージです。複数行にわたって表示される可能性があり、CloseIconが右上に固定表示されることを確認するためのテストメッセージです。テキストが長くなってもCloseIconが画面内に表示され続けることを確認してください。',
            'SUCCESS'
          )}
          color="primary"
        />
        
        <ButtonBase
          label="複数行メッセージを表示"
          onClick={() => showSnackbar(
            '1行目のメッセージです。\n2行目のメッセージです。\n3行目のメッセージです。',
            'ALERT'
          )}
          color="primary"
        />

        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3>CloseIcon修正点</h3>
          <ul>
            <li>CloseIconが右上（top: 5px）に固定配置されるよう修正</li>
            <li>テキストが長くなってもCloseIconが画面内に表示される</li>
            <li>ERRORタイプは自動で消えない仕様</li>
            <li>SUCCESS/ALERTタイプは5秒後に自動で消える</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof SnackbarNotification> = {
  title: 'Functional/SnackbarNotification',
  component: SnackbarNotification,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Snackbar通知を表示するコンポーネント。useSnackbarフックと連携して動作し、SUCCESS/ERROR/ALERTタイプのメッセージを表示できます。CloseIconは右上に固定配置され、長いテキストでも常に表示されます。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const store = createTestStore();
      return (
        <Provider store={store}>
          <Story />
        </Provider>
      );
    },
  ],
} satisfies Meta<typeof SnackbarNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

// 成功メッセージのストーリー
export const SuccessMessage: Story = {
  render: () => (
    <SnackbarWrapper 
      message="操作が正常に完了しました！" 
      type="SUCCESS" 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '成功時に表示される緑色のSnackbar。CheckCircleIconとともに表示され、5秒後に自動で消えます。',
      },
    },
  },
};

// エラーメッセージのストーリー
export const ErrorMessage: Story = {
  render: () => (
    <SnackbarWrapper 
      message="エラーが発生しました。もう一度お試しください。" 
      type="ERROR" 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'エラー時に表示される赤色のSnackbar。ErrorIconとともに表示され、自動では消えません（手動でCloseIconをクリックする必要があります）。',
      },
    },
  },
};

// 警告メッセージのストーリー
export const WarningMessage: Story = {
  render: () => (
    <SnackbarWrapper 
      message="この操作には注意が必要です。" 
      type="ALERT" 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '警告時に表示されるオレンジ色のSnackbar。WarningIconとともに表示され、5秒後に自動で消えます。',
      },
    },
  },
};

// 長いメッセージのストーリー（CloseIcon位置テスト用）
export const LongMessage: Story = {
  render: () => (
    <SnackbarWrapper 
      message="これは非常に長いメッセージです。複数行にわたって表示される可能性があり、CloseIconが右上に固定表示されることを確認するためのテストメッセージです。テキストが長くなってもCloseIconが画面内に表示され続けることを確認してください。" 
      type="SUCCESS" 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '長いテキストでもCloseIconが右上に固定表示され、画面内に収まることを確認するためのストーリー。',
      },
    },
  },
};

// 複数行メッセージのストーリー
export const MultilineMessage: Story = {
  render: () => (
    <SnackbarWrapper 
      message={'1行目のメッセージです。\n2行目のメッセージです。\n3行目のメッセージです。'} 
      type="ALERT" 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '改行を含む複数行メッセージの表示例。pre-wrapによって改行が適切に表示されます。',
      },
    },
  },
};

// インタラクティブデモ
export const InteractiveDemo: Story = {
  render: () => <InteractiveSnackbarDemo />,
  parameters: {
    docs: {
      description: {
        story: 'インタラクティブなデモ。各ボタンをクリックして異なるタイプのSnackbarを表示できます。CloseIconの位置修正やメッセージタイプの動作を確認できます。',
      },
    },
  },
};

// メッセージがない場合（非表示状態）
export const NoMessage: Story = {
  render: () => (
    <SnackbarWrapper />
  ),
  parameters: {
    docs: {
      description: {
        story: 'メッセージがない場合はSnackbarは表示されません。',
      },
    },
  },
};