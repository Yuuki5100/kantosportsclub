// src/hooks/useWSSubscription.ts
import { useEffect, useRef } from 'react';
import { useWebSocketContext } from '@/components/providers/WebSocketProvider';
import type { WebSocketEventHandler } from '@/utils/webSocketClient';

/**
 * WebSocketイベント購読フック
 * 
 * シンプルなWebSocketイベント購読Hook
 * アンマウント時にイベント削除
 * 
 * @param eventType - 購読するイベントタイプ
 * @param handler - イベント受信時のコールバック関数（undefinedの場合は購読しない）
 * @param enabled - 購読を有効にするかどうか（デフォルト: true）
 * @param options - オプション設定（後方互換性のため）
 * @param options.isGlobal - グローバルハンドラーとして登録するか（デフォルト: false）
 * @param options.autoCleanup - 自動クリーンアップ（使用されません、互換性のため）
 * @returns handlerId - この購読のユニークID（デバッグ用）
 */
export const useWSSubscription = (
  eventType: string,
  handler: WebSocketEventHandler | null | undefined,
  enabled: boolean = true,
  options?: { 
    isGlobal?: boolean;
    autoCleanup?: boolean;
  }
): string | null => {
  const { addHandler, removeHandler } = useWebSocketContext();
  const handlerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !handler) {
      // 無効化または無効なハンドラーの場合、既存の購読を解除
      if (handlerIdRef.current) {
        removeHandler(eventType, handlerIdRef.current);
        handlerIdRef.current = null;
      }
      return;
    }

    // イベントを購読（Context経由）
    const handlerId = addHandler(eventType, handler, options?.isGlobal ?? false);
    handlerIdRef.current = handlerId;

    // クリーンアップ：コンポーネントアンマウント時またはdeps変更時
    return () => {
      // isGlobal: trueの場合は削除しない（仕様修正）
      if (handlerIdRef.current && !options?.isGlobal) {
        removeHandler(eventType, handlerIdRef.current);
        handlerIdRef.current = null;
      }
    };
  }, [addHandler, removeHandler, eventType, handler, enabled, options?.isGlobal]);

  return handlerIdRef.current;
};

/**
 * グローバルWebSocketイベント購読フック
 * 
 * 永続化するグローバルハンドラー用のHook
 * （スナックバー通知など、全画面で共通の処理）
 */
export const useGlobalWebSocketEvent = (
  eventType: string,
  handler: WebSocketEventHandler | null | undefined,
  enabled: boolean = true
): string | null => {
  return useWSSubscription(eventType, handler, enabled, { isGlobal: true });
};

/**
 * 複数のWebSocketイベントを同時購読するHook
 * 
 * @param subscriptions - 購読設定の配列
 * @returns handlerIdのマップ
 */
export const useMultipleWebSocketEvents = (
  subscriptions: Array<{
    eventType: string;
    handler: WebSocketEventHandler | null | undefined;
    enabled?: boolean;
    isGlobal?: boolean;
  }>
): Record<string, string | null> => {
  const handlerIds: Record<string, string | null> = {};

  subscriptions.forEach(({ eventType, handler, enabled = true, isGlobal = false }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    handlerIds[eventType] = useWSSubscription(eventType, handler, enabled, { isGlobal });
  });

  return handlerIds;
};

/**
 * WebSocketイベントの条件付き購読Hook
 * 
 * 特定の条件下でのみ購読し、条件が満たされなくなったら
 * 自動的に購読解除する
 */
export const useConditionalWebSocketEvent = (
  eventType: string,
  handler: WebSocketEventHandler | null | undefined,
  condition: boolean,
  isGlobal: boolean = false
): string | null => {
  return useWSSubscription(eventType, handler, condition, { isGlobal });
};
