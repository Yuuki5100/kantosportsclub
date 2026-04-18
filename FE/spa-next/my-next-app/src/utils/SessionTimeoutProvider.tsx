// src/utils/SessionTimeoutProvider.tsx
'use client';

import React, { useCallback } from 'react';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useRouter } from 'next/router';
import { getMessage, MessageCodes } from '@/message';

type SessionTimeoutError = {
  response?: {
    data?: {
      eventType?: string;
    };
  };
};

const getSessionEventType = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const { response } = error;
  if (typeof response !== "object" || response === null || !("data" in response)) {
    return undefined;
  }

  const { data } = response;
  if (typeof data !== "object" || data === null || !("eventType" in data)) {
    return undefined;
  }

  return typeof data.eventType === "string" ? data.eventType : undefined;
};

let globalSessionTimeoutHandler: ((err?: SessionTimeoutError | unknown) => void) | null = null;

export const SessionTimeoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const handleSessionTimeout = useCallback((err?: SessionTimeoutError | unknown) => {
    if (getSessionEventType(err) === "USER_SESSION_EXPIRED") {
      showSnackbar(getMessage(MessageCodes.SESSION_EXPIRED), "ERROR");
      router.replace("/login");
    }
  }, [showSnackbar, router]);

  // グローバル変数にセット
  // useEffect(() => {
  globalSessionTimeoutHandler = handleSessionTimeout;
  //   return () => { globalSessionTimeoutHandler = null; };
  // }, [handleSessionTimeout]);

  return <>{children}</>;
};

// どこからでも呼べるユーティリティ
export const notifySessionTimeout = (err?: SessionTimeoutError | unknown) => {
  globalSessionTimeoutHandler?.(err);
};
