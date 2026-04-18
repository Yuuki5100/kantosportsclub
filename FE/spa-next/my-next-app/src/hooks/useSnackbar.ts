// src/hooks/useSnackbar.ts
import { useAppDispatch, useAppSelector } from '@/hooks';
import type { RootState } from '@/store';
import { showSnackbar as showSnackbarAction, hideSnackbar as hideSnackbarAction } from '@/slices/snackbarSlice';
import type { SnackbarType } from '@/slices/snackbarSlice';
import { useCallback, type ReactNode } from 'react';

/**
 * Snackbarで通知を表示するカスタムフック
 *
 * @return {*}
 * @property {ReactNode | null} message - 現在のSnackbarメッセージ
 * @property {SnackbarType | null} type - 現在のSnackbarタイプ
 * @property {function} showSnackbar - Snackbarを表示する関数 typeを指定しない場合はALERT
 * @property {function} hideSnackbar - Snackbarを非表示にする
 */
export const useSnackbar: () => {
  message: ReactNode | null;
  type: SnackbarType | null;
  showSnackbar: (message: ReactNode, type?: SnackbarType) => void;
  hideSnackbar: () => void;
} = () => {
  const { message, type } = useAppSelector((state: RootState) => state.snackbar);
  const dispatch = useAppDispatch();

  const showSnackbar = useCallback((message: ReactNode, type: SnackbarType = 'ALERT') => {
    dispatch(showSnackbarAction({ message, type }));
  }, [dispatch]);

  const hideSnackbar = useCallback(() => {
    dispatch(hideSnackbarAction());
  }, [dispatch]);

  return { message, type, showSnackbar, hideSnackbar };
};
