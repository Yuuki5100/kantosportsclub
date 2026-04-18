// src/hooks/useError.ts
import { useAppDispatch, useAppSelector } from '@/hooks';
import type { RootState } from '../store';
import { setErrorMessage, clearErrorMessage } from '../slices/errorSlice';

export const useError = () => {
  const errorMessage = useAppSelector((state: RootState) => state.error.message);
  const dispatch = useAppDispatch();

  const showError = (message: string) => {
    console.error('[ValidationError]', message); // ← これを追加推奨
    dispatch(setErrorMessage(message));
  };

  const clearError = () => {
    dispatch(clearErrorMessage());
  };

  return { errorMessage, showError, clearError };
};
