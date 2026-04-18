// src/components/providers/WebSocketProvider.tsx
'use client';

import { WebSocketClient, createDefaultWebSocketClient } from '@/utils/webSocketClient';
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAppSelector } from '@/hooks';
import type { RootState } from '@/store';
import { v4 as uuidv4 } from 'uuid';
import { getMessage, MessageCodes } from '@/message';

/**
 * Notification Payload Type
 */
export type NotificationPayload = {
  id?: string;
  eventType: string;
  refId?: string;
  extension?: string;
  jobName?: string;
  fileName?: string;
  message?: string;
  timestamp?: number;
  [key: string]: any; // 追加のプロパティを許可
};

/**
 * Event Subscription Type
 */
type EventSubscription = {
  id: string;
  handler: (data: any) => void;
  isGlobal: boolean;
};

/**
 * WebSocket Context Value Type
 */
type WebSocketContextValue = {
  client: WebSocketClient;
  addHandler: (eventType: string, handler: (data: any) => void, isGlobal: boolean) => string;
  removeHandler: (eventType: string, handlerId: string) => void;
  getHandlers: (eventType: string) => EventSubscription[];
  getActiveEventTypes: () => string[];
  // 通知管理
  notifications: NotificationPayload[];
  addNotification: (notification: NotificationPayload) => void;
  clearNotifications: () => void;
};

/**
 * WebSocketContext
 */
const WebSocketContext = createContext<WebSocketContextValue | null>(null);

/**
 * WebSocketProvider Props
 */
type WebSocketProviderProps = {
  children: ReactNode;
  ClientFactory?: () => WebSocketClient;
  autoConnect?: boolean;
  debug?: boolean;
}

/**
 * Ultra-Simple WebSocketProvider
 *
 * WebSocketClientをReact Contextで提供し、
 * Context-onlyでハンドラーと通知を管理
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  ClientFactory = createDefaultWebSocketClient,
  autoConnect = true,
  debug = false,
}) => {
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const ClientRef = useRef<WebSocketClient | null>(null);
  const isInitializedRef = useRef(false);

  // Context内でhandlerを管理
  const [eventHandlers, setEventHandlers] = useState<Record<string, EventSubscription[]>>({});

  // 通知の状態管理
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  // WebSocketClientの初期化（1回のみ）
  if (!ClientRef.current && !isInitializedRef.current) {
    ClientRef.current = ClientFactory();
    isInitializedRef.current = true;

    if (debug) {
      console.log('🚀 WebSocketClient created');
    }
  }

  // Handler管理関数（useCallbackでメモ化）
  const addHandler = React.useCallback((eventType: string, handler: (data: any) => void, isGlobal: boolean): string => {
    const handlerId = uuidv4();
    const subscription: EventSubscription = { id: handlerId, handler, isGlobal };

    setEventHandlers(prev => ({
      ...prev,
      [eventType]: [...(prev[eventType] || []), subscription]
    }));

    if (debug) {
      console.log(`📋 Handler added for ${eventType} (${isGlobal ? 'global' : 'local'})`);
    }

    return handlerId;
  }, [debug]);

  const removeHandler = React.useCallback((eventType: string, handlerId: string): void => {
    setEventHandlers(prev => {
      const handlers = prev[eventType] || [];
      const filtered = handlers.filter(h => h.id !== handlerId);

      if (filtered.length === 0) {
        const { [eventType]: _removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [eventType]: filtered
      };
    });

    if (debug) {
      console.log(`📋 Handler removed from ${eventType}`);
    }
  }, [debug]);

  const getHandlers = React.useCallback((eventType: string): EventSubscription[] => {
    return eventHandlers[eventType] || [];
  }, [eventHandlers]);

  const getActiveEventTypes = React.useCallback((): string[] => {
    return Object.keys(eventHandlers).filter(eventType =>
      eventHandlers[eventType] && eventHandlers[eventType].length > 0
    );
  }, [eventHandlers]);

  // 通知管理関数
  const addNotification = React.useCallback((notification: NotificationPayload) => {
    const notificationWithDefaults: NotificationPayload = {
      id: notification.id || uuidv4(),
      timestamp: notification.timestamp || Date.now(),
      ...notification
    };

    setNotifications(prev => [...prev, notificationWithDefaults]);

    if (debug) {
      console.log(`📢 Notification added:`, notificationWithDefaults);
    }
  }, [debug]);

  const clearNotifications = React.useCallback(() => {
    setNotifications([]);
    if (debug) {
      console.log('🧹 Notifications cleared');
    }
  }, [debug]);

  // Context valueをメモ化して不要な再レンダリングを防ぐ
  const contextValue: WebSocketContextValue = React.useMemo(() => ({
    client: ClientRef.current!,
    addHandler,
    removeHandler,
    getHandlers,
    getActiveEventTypes,
    notifications,
    addNotification,
    clearNotifications,
  }), [addHandler, removeHandler, getHandlers, getActiveEventTypes, notifications, addNotification, clearNotifications]);

  // WebSocket接続とハンドラー設定
  useEffect(() => {
    const Client = ClientRef.current;
    if (!Client) return;

    // Handler Callbacksを設定（通知管理を含む）
    Client.setHandlerCallbacks({
      getHandlers,
      getActiveEventTypes,
      addNotification,
    });

    if (debug) {
      console.log('🏪 WebSocketClient integrated with Context-only handlers');
    }

    // 自動接続（認証済みの場合のみ）
    if (autoConnect && isAuthenticated === true) {
      const initializeConnection = async () => {
        try {
          await Client.connect();
          if (debug) {
            console.log('✅ WebSocket auto-connected');
          }
        } catch (error) {
          if (debug) {
            console.error('❌ WebSocket auto-connection failed:', error);
          }
        }
      };

      initializeConnection();
    }

    // 未認証時は切断
    if (isAuthenticated === false) {
      Client.disconnect();
    }

    // クリーンアップ
    return () => {
      Client.disconnect();
    };
  }, [autoConnect, isAuthenticated, debug, getHandlers, getActiveEventTypes, addNotification]);

  // eventHandlersの変更を監視し、STOMP購読を同期
  useEffect(() => {
    const Client = ClientRef.current;
    if (!Client) return;

    // WebSocketClient内のsyncSubscriptionsを呼び出すためのトリガー
    const activeTypes = Object.keys(eventHandlers).filter(eventType =>
      eventHandlers[eventType] && eventHandlers[eventType].length > 0
    );

    if (debug && activeTypes.length > 0) {
      console.log('🔄 Handler state changed, active events:', activeTypes);
    }
  }, [eventHandlers, debug]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * WebSocketClientを取得するHook
 */
export const useWebSocketClient = (): WebSocketClient => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(getMessage(MessageCodes.WEBSOCKET_CLIENT_REQUIRED));
  }
  return context.client;
};

/**
 * WebSocket Context全体を取得するHook
 */
export const useWebSocketContext = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(getMessage(MessageCodes.WEBSOCKET_CONTEXT_REQUIRED));
  }
  return context;
};

/**
 * WebSocket接続状態を取得するHook
 */
export const useWebSocketStatus = () => {
  const { client } = useWebSocketContext();
  const [status, setStatus] = useState(client.getStatus());

  useEffect(() => {
    // 定期的に状態を更新（簡易実装）
    const interval = setInterval(() => {
      setStatus(client.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [client]);

  return status;
};

/**
 * 通知を取得するHook
 */
export const useNotifications = () => {
  const { notifications } = useWebSocketContext();
  return notifications;
};

/**
 * 最新の通知を取得するHook
 */
export const useLatestNotification = () => {
  const { notifications } = useWebSocketContext();
  return notifications.at(-1);
};

/**
 * 通知をクリアする関数を取得するHook
 */
export const useClearNotifications = () => {
  const { clearNotifications } = useWebSocketContext();
  return clearNotifications;
};
