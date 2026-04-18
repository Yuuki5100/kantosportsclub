// src/components/SnackbarListener.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useLatestNotification } from '@/components/providers/WebSocketProvider';
import { getMessage, MessageCodes } from '@/message';

export const SnackbarListener = () => {
  /** 最新の通知を監視 */
  const latest = useLatestNotification();

  /** 同じ通知を重複処理しないためのガード */
  const handledId = useRef<string>('');

  /** snackbar API */
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    // 通知が無い or 同じ通知をもう処理していたら noop
    if (!latest || handledId.current === latest.id) return;

    // 今回の通知 ID を記録
    handledId.current = latest.id || '';

    /* -------- 通知 → スナックバー -------- */
    switch (latest.eventType) {
      case 'FILE_CREATE_PROGRESS':
        // 進捗はアップロード画面側で処理する
        break;

      case 'FILE_UPLOAD_COMPLETED':
        showSnackbar(getMessage(MessageCodes.UPLOAD_SUCCESS), 'SUCCESS');
        break;

      case 'FILE_DOWNLOAD_COMPLETED':
        showSnackbar(getMessage(MessageCodes.FILE_DOWNLOAD_READY), 'SUCCESS');
        break;

      case 'USER_SESSION_EXPIRED':
        showSnackbar(getMessage(MessageCodes.SESSION_EXPIRED), 'ERROR');
        // 例 : router.push('/login') など
        break;

      default:
        // eventType をそのまま出す簡易ハンドラ
        showSnackbar(latest.eventType, 'ALERT');
    }
    /* ------------------------------------- */
  }, [latest, showSnackbar]);

  return null; // UI 不要
};
