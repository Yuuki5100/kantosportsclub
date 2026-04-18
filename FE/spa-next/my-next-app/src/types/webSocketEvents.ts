// src/types/webSocketEvents.ts

/**
 * WebSocketイベントのデータ型定義
 * バックエンドから送信されるデータの型
 * イベントタイプは文字列として自由に受け付ける
 */
export type WSEventData = Record<string, unknown>;

/**
 * WebSocketイベントハンドラーの型定義
 */
export type WSEventHandler = (data: WSEventData) => void;

/**
 * 汎用的なWebSocketメッセージの型定義
 */
export type WSMessage = {
  eventType?: string;
  [key: string]: unknown;
};