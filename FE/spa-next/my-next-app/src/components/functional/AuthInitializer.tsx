// src/components/functional/AuthInitializer.tsx
import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import { hydrateFromSession } from '@/slices/authSlice';

const AuthInitializer = () => {
  const { refreshAuth } = useAuth();
  const dispatch = useAppDispatch();
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;

      // ① sessionStorageから即時復元（SSR後のクライアント初期化）
      dispatch(hydrateFromSession());

      // ② バックエンドで認証状態を検証
      refreshAuth(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default AuthInitializer;
