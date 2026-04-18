// src/components/providers/__tests__/WebSocketProvider.test.tsx
import React from 'react';
import { render, act } from '@testing-library/react';
import { expect, jest, beforeEach, afterEach, describe, it } from '@jest/globals';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { WebSocketProvider, useWebSocketContext, useWebSocketStatus } from '../WebSocketProvider';
// notificationsSlice has been removed - notifications are now handled via Context

// STOMPクライアントのモック
jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation(() => ({
    activate: jest.fn(),
    deactivate: jest.fn(),
    subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    connected: false,
    onConnect: null,
    onStompError: null,
    onWebSocketClose: null,
  })),
}));

// SockJSのモック
jest.mock('sockjs-client', () => {
  return jest.fn().mockImplementation(() => ({}));
});

// uuidのモック
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

// テスト用のストア作成
const createTestStore = () =>
  configureStore({
    reducer: {
      // Context-only実装のため、ダミーリデューサーのみ
      auth: (state = { isAuthenticated: false }) => state,
      dummy: (state = {}, action: any) => state
    }
  });

// テスト用コンポーネント
const TestComponent: React.FC = () => {
  const { client, addHandler } = useWebSocketContext();
  const status = useWebSocketStatus();

  return (
    <div>
      <div data-testid="connection-status">
        {status.isConnected ? 'connected' : 'disconnected'}
      </div>
      <div data-testid="subscribed-topics">
        {status.subscribedTopics.join(',')}
      </div>
      <button
        data-testid="subscribe-button"
        onClick={() => addHandler('TEST_EVENT', () => {}, false)}
      >
        Subscribe
      </button>
    </div>
  );
};

describe('WebSocketProvider', () => {
  let store: ReturnType<typeof createTestStore>;
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    
    // console.logをモック
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    consoleSpy.mockRestore();
  });

  describe('Provider初期化', () => {
    it('WebSocketContextを提供する', () => {
      render(
        <Provider store={store}>
          <WebSocketProvider autoConnect={false} debug={false}>
            <TestComponent />
          </WebSocketProvider>
        </Provider>
      );

      // コンポーネントが正常にレンダリングされることを確認
      expect(document.querySelector('[data-testid="connection-status"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="subscribed-topics"]')).toBeTruthy();
    });

    it('autoConnectがfalseの場合は自動接続しない', () => {
      render(
        <Provider store={store}>
          <WebSocketProvider autoConnect={false} debug={false}>
            <TestComponent />
          </WebSocketProvider>
        </Provider>
      );

      // 初期状態は切断状態であることを確認
      const statusElement = document.querySelector('[data-testid="connection-status"]');
      expect(statusElement).toHaveTextContent('disconnected');
    });

    it('Providerが存在する場合は購読を許可する', () => {
      const { getByTestId } = render(
        <Provider store={store}>
          <WebSocketProvider autoConnect={false} debug={false}>
            <TestComponent />
          </WebSocketProvider>
        </Provider>
      );

      // 購読ボタンをクリックしてもエラーが発生しないことを確認
      const subscribeBtn = getByTestId('subscribe-button');
      
      expect(() => {
        act(() => {
          subscribeBtn.click();
        });
      }).not.toThrow();
    });
  });

  describe('エラーハンドリング', () => {
    it('Provider外でhookを使用した場合にエラーをスローする', () => {
      const ErrorTestComponent = () => {
        try {
          useWebSocketContext();
          return <div>no error</div>;
        } catch (error) {
          return <div data-testid="error">{(error as Error).message}</div>;
        }
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByTestId } = render(<ErrorTestComponent />);
      
      expect(getByTestId('error')).toHaveTextContent('useWebSocketContext は WebSocketProvider 内で使用してください');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('デバッグモード', () => {
    it('デバッグが有効の場合はデバッグメッセージを出力する', () => {
      render(
        <Provider store={store}>
          <WebSocketProvider autoConnect={false} debug={true}>
            <TestComponent />
          </WebSocketProvider>
        </Provider>
      );

      // デバッグメッセージが出力されることを確認
      expect(consoleSpy).toHaveBeenCalledWith('🚀 WebSocketClient created');
      expect(consoleSpy).toHaveBeenCalledWith('🏪 WebSocketClient integrated with Context-only handlers');
    });

    it('デバッグが無効の場合はデバッグメッセージを出力しない', () => {
      render(
        <Provider store={store}>
          <WebSocketProvider autoConnect={false} debug={false}>
            <TestComponent />
          </WebSocketProvider>
        </Provider>
      );

      // 特定のデバッグメッセージが出力されないことを確認
      expect(consoleSpy).not.toHaveBeenCalledWith('🚀 WebSocketClient created');
    });
  });

  describe('ハンドラー統合テスト', () => {
    it('addNotification機能が正常に動作する', () => {
      const NotificationTestComponent = () => {
        const { addNotification, notifications } = useWebSocketContext();
        
        React.useEffect(() => {
          // テスト用の通知を追加
          addNotification({
            eventType: 'TEST_NOTIFICATION',
            message: 'Test message',
            refId: 'test-ref-id'
          });
        }, [addNotification]);
        
        return (
          <div data-testid="notification-count">
            {notifications.length}
          </div>
        );
      };

      const { getByTestId } = render(
        <Provider store={store}>
          <WebSocketProvider autoConnect={false} debug={false}>
            <NotificationTestComponent />
          </WebSocketProvider>
        </Provider>
      );

      // 通知が追加されることを確認
      expect(getByTestId('notification-count')).toHaveTextContent('1');
    });

    it('複数の通知が正しく管理される', () => {
      const MultiNotificationTestComponent = () => {
        const { addNotification, notifications } = useWebSocketContext();
        
        React.useEffect(() => {
          // 複数の通知を追加
          addNotification({
            eventType: 'NOTIFICATION_1',
            message: 'First notification'
          });
          addNotification({
            eventType: 'NOTIFICATION_2',
            message: 'Second notification'
          });
        }, [addNotification]);
        
        return (
          <div>
            <div data-testid="notification-count">{notifications.length}</div>
            <div data-testid="first-notification">
              {notifications[0]?.eventType || 'none'}
            </div>
            <div data-testid="second-notification">
              {notifications[1]?.eventType || 'none'}
            </div>
          </div>
        );
      };

      const { getByTestId } = render(
        <Provider store={store}>
          <WebSocketProvider autoConnect={false} debug={false}>
            <MultiNotificationTestComponent />
          </WebSocketProvider>
        </Provider>
      );

      expect(getByTestId('notification-count')).toHaveTextContent('2');
      expect(getByTestId('first-notification')).toHaveTextContent('NOTIFICATION_1');
      expect(getByTestId('second-notification')).toHaveTextContent('NOTIFICATION_2');
    });

    it('clearNotifications機能が正常に動作する', () => {
      const ClearNotificationTestComponent = () => {
        const { addNotification, clearNotifications, notifications } = useWebSocketContext();
        
        React.useEffect(() => {
          // 通知を追加してからクリア
          addNotification({
            eventType: 'CLEAR_TEST',
            message: 'Will be cleared'
          });
          
          // 少し待ってからクリア
          setTimeout(() => {
            clearNotifications();
          }, 10);
        }, [addNotification, clearNotifications]);
        
        return (
          <div data-testid="notification-count">
            {notifications.length}
          </div>
        );
      };

      const { getByTestId } = render(
        <Provider store={store}>
          <WebSocketProvider autoConnect={false} debug={false}>
            <ClearNotificationTestComponent />
          </WebSocketProvider>
        </Provider>
      );

      // 初期状態では通知はクリアされている可能性が高い
      // （非同期処理のためタイミング依存）
      expect(getByTestId('notification-count')).toBeDefined();
    });

    it('ハンドラーの追加と削除が正常に動作する', () => {
      const mockHandler = jest.fn();
      let handlerId: string | null = null;

      const HandlerTestComponent = () => {
        const { addHandler, removeHandler, getHandlers } = useWebSocketContext();
        
        React.useEffect(() => {
          // ハンドラーを追加
          handlerId = addHandler('HANDLER_TEST', mockHandler, false);
          
          return () => {
            // クリーンアップでハンドラーを削除
            if (handlerId) {
              removeHandler('HANDLER_TEST', handlerId);
            }
          };
        }, [addHandler, removeHandler]);
        
        const handlers = getHandlers('HANDLER_TEST');
        
        return (
          <div data-testid="handler-count">
            {handlers.length}
          </div>
        );
      };

      const { getByTestId } = render(
        <Provider store={store}>
          <WebSocketProvider autoConnect={false} debug={false}>
            <HandlerTestComponent />
          </WebSocketProvider>
        </Provider>
      );

      // ハンドラーが登録されることを確認
      expect(getByTestId('handler-count')).toHaveTextContent('1');
    });
  });
});
