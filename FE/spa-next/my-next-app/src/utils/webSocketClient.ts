// src/utils/webSocketClient.ts
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { v4 as uuidv4 } from 'uuid';
import type { NotificationPayload } from '@/components/providers/WebSocketProvider';
import { getMessage, MessageCodes } from '@/message';

/**
 * WebSocketClient設定
 */
export type WebSocketClientConfig = {
  url?: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
  enableNotifications?: boolean;
  enableCustomHandlers?: boolean;
}

/**
 * Event Subscription Type
 */
export type EventSubscription = {
  id: string;
  handler: WebSocketEventHandler;
  isGlobal: boolean;
};

export type WebSocketEventHandler = (data: unknown) => void;

/**
 * Handler Management Callbacks
 */
export type HandlerCallbacks = {
  getHandlers: (eventType: string) => EventSubscription[];
  getActiveEventTypes: () => string[];
  addNotification?: (notification: NotificationPayload) => void; // 通知追加関数（オプション）
};

const toNotificationPayload = (
  payload: unknown,
  eventType: string
): NotificationPayload => {
  const payloadRecord =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : { data: payload };

  return {
    ...payloadRecord,
    eventType,
    id: uuidv4(),
    timestamp: Date.now(),
  };
};

/**
 * WebSocketClient インターフェース
 */
export type WebSocketClient = {
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribe: (eventType: string, handler: WebSocketEventHandler, isGlobal?: boolean) => string;
  unsubscribe: (eventType: string, handlerId: string) => void;
  getStatus: () => {
    isConnected: boolean;
    subscribedTopics: string[];
    config: WebSocketClientConfig;
  };
  setHandlerCallbacks: (callbacks: HandlerCallbacks) => void;
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: Required<WebSocketClientConfig> = {
  url: process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8888/ws',
  reconnectDelay: 5000,
  maxReconnectAttempts: 10,
  debug: false,
  enableNotifications: true,
  enableCustomHandlers: true,
};

/**
 * Ultra-Simple WebSocketClient Factory
 *
 * Context-based handler management with STOMP connection
 */
export const createWebSocketClient = (config: WebSocketClientConfig = {}): WebSocketClient => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // プライベート状態（クロージャで管理）
  let stompClient: Client | null = null;
  let handlerCallbacks: HandlerCallbacks | null = null;
  let isConnected = false;
  let reconnectAttempts = 0;
  let intentionalDisconnect = false;

  // 現在のSTOMP購読を管理
  const stompSubscriptions = new Map<string, StompSubscription>();

  // 再接続タイマー
  let reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Context状態とSTOMP購読を同期
   */
  const syncSubscriptions = () => {
    if (!stompClient?.connected || !handlerCallbacks) return;

    const activeEventTypes = handlerCallbacks.getActiveEventTypes();

    if (finalConfig.debug) {
      console.log('🔄 Syncing subscriptions:', activeEventTypes);
    }

    // 必要な購読を追加
    activeEventTypes.forEach(eventType => {
      const topic = `/topic/notify/${eventType.toLowerCase()}`;

      if (!stompSubscriptions.has(topic)) {
        subscribeToTopic(topic, eventType);
      }
    });

    // 不要な購読を削除
    const currentTopics = Array.from(stompSubscriptions.keys());
    const requiredTopics = activeEventTypes.map(eventType => `/topic/notify/${eventType.toLowerCase()}`);

    currentTopics.forEach(topic => {
      if (!requiredTopics.includes(topic)) {
        unsubscribeFromTopic(topic);
      }
    });
  };

  /**
   * STOMPトピックを購読
   */
  const subscribeToTopic = (topic: string, eventType: string) => {
    if (!stompClient?.connected) return;

    const subscription = stompClient.subscribe(topic, (frame) => {
      try {
        const payload: unknown = JSON.parse(frame.body);

        if (finalConfig.debug) {
          console.log(`📨 Received message for ${eventType}:`, payload);
        }

        // 1. 通知システム用の処理（Context経由）
        if (finalConfig.enableNotifications && handlerCallbacks?.addNotification) {
          handlerCallbacks.addNotification(toNotificationPayload(payload, eventType));
        } else if (finalConfig.enableNotifications && finalConfig.debug) {
          console.log('📢 Notification skipped (no addNotification callback):', { eventType, payload });
        }

        // 2. カスタムハンドラーの実行
        if (finalConfig.enableCustomHandlers && handlerCallbacks) {
          const handlers = handlerCallbacks.getHandlers(eventType);

          handlers.forEach(({ handler }) => {
            try {
              handler(payload);
            } catch (error) {
              console.error(`Handler execution failed for ${eventType}:`, error);
            }
          });
        }
      } catch (error) {
        console.error('Message parsing failed:', error);
      }
    });

    stompSubscriptions.set(topic, subscription);

    if (finalConfig.debug) {
      console.log(`🔔 Subscribed to topic: ${topic}`);
    }
  };

  /**
   * STOMPトピック購読を解除
   */
  const unsubscribeFromTopic = (topic: string) => {
    const subscription = stompSubscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      stompSubscriptions.delete(topic);

      if (finalConfig.debug) {
        console.log(`🔕 Unsubscribed from topic: ${topic}`);
      }
    }
  };

  /**
   * 再接続スケジューリング
   */
  const scheduleReconnect = () => {
    if (intentionalDisconnect) return;
    if (reconnectAttempts >= finalConfig.maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts (${finalConfig.maxReconnectAttempts}) reached`);
      return;
    }

    const delay = Math.min(finalConfig.reconnectDelay * Math.pow(2, reconnectAttempts), 30000);
    reconnectAttempts++;

    if (finalConfig.debug) {
      console.log(`🔄 Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts})`);
    }

    reconnectTimer = setTimeout(async () => {
      try {
        await connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
        scheduleReconnect();
      }
    }, delay);
  };

  /**
   * WebSocket/STOMP接続を確立
   */
  const connect = async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    intentionalDisconnect = false;
    if (stompClient?.connected) return;

    // 既存の接続をクリーンアップ
    if (stompClient) {
      stompClient.deactivate();
    }

    const socket = new SockJS(finalConfig.url!);
    stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 0, // 自前でリトライ制御
      debug: finalConfig.debug ? (str) => console.log(str) : () => {},

      onConnect: () => {
        isConnected = true;
        reconnectAttempts = 0;

        if (finalConfig.debug) {
          console.log('✅ WebSocketClient connected');
        }

        // 接続後に購読を同期
        syncSubscriptions();
      },

      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
        isConnected = false;
      },

      onWebSocketClose: () => {
        if (finalConfig.debug) {
          console.log('🔌 WebSocket connection closed');
        }
        isConnected = false;
        stompSubscriptions.clear();
        scheduleReconnect();
      },
    });

    return new Promise<void>((resolve, reject) => {
      const originalOnConnect = stompClient!.onConnect;
      const originalOnStompError = stompClient!.onStompError;

      stompClient!.onConnect = (frame) => {
        originalOnConnect?.(frame);
        resolve();
      };

      stompClient!.onStompError = (frame) => {
        originalOnStompError?.(frame);
        reject(new Error(getMessage(MessageCodes.STOMP_CONNECTION_FAILED)));
      };

      stompClient!.activate();
    });
  };

  /**
   * WebSocket接続を切断
   */
  const disconnect = () => {
    intentionalDisconnect = true;

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (stompClient?.connected) {
      stompClient.deactivate();
    }

    stompSubscriptions.clear();
    isConnected = false;
    reconnectAttempts = 0;

    if (finalConfig.debug) {
      console.log('🛑 WebSocketClient disconnected');
    }
  };

  /**
   * イベント購読（Context経由で管理）
   */
  const subscribe = (
    _eventType: string,
    _handler: WebSocketEventHandler,
    _isGlobal: boolean = false
  ): string => {
    // Context経由で管理されるため、何もしない（ダミー実装）
    // 実際のhandler管理はWebSocketProvider側で行われる
    return uuidv4();
  };

  /**
   * イベント購読解除（Context経由で管理）
   */
  const unsubscribe = (_eventType: string, _handlerId: string) => {
    // Context経由で管理されるため、何もしない（ダミー実装）
    // 実際のhandler管理はWebSocketProvider側で行われる
  };


  /**
   * Handler Callbacksを設定
   */
  const setHandlerCallbacks = (callbacks: HandlerCallbacks) => {
    handlerCallbacks = callbacks;

    // 接続済みの場合は即座に同期
    if (stompClient?.connected) {
      syncSubscriptions();
    }

    if (finalConfig.debug) {
      console.log('🔗 Handler callbacks set');
    }
  };

  /**
   * 接続状態を取得
   */
  const getStatus = () => ({
    isConnected,
    subscribedTopics: Array.from(stompSubscriptions.keys()),
    config: finalConfig,
  });

  // パブリックAPIを返す
  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    getStatus,
    setHandlerCallbacks,
  };
};

/**
 * デフォルト設定でWebSocketClientを作成
 */
export const createDefaultWebSocketClient = (): WebSocketClient => {
  return createWebSocketClient({
    enableNotifications: true,
    enableCustomHandlers: true,
  });
};

/**
 * 通知専用WebSocketClient
 */
export const createNotificationOnlyWebSocketClient = (): WebSocketClient => {
  return createWebSocketClient({
    enableNotifications: true,
    enableCustomHandlers: false,
  });
};

/**
 * カスタムハンドラー専用WebSocketClient
 */
export const createCustomHandlerOnlyWebSocketClient = (): WebSocketClient => {
  return createWebSocketClient({
    enableNotifications: false,
    enableCustomHandlers: true,
  });
};
