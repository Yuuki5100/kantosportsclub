// src/hooks/useCurrentLanguage.ts
import { useAppDispatch, useAppSelector } from '@/hooks';
import type { RootState } from '../store';
import { LangPattern, setLanguage } from '../slices/langSlice';

export const useCurrentLanguage = () => {
  const language = useAppSelector((state: RootState) => state.lang.language);
  const dispatch = useAppDispatch();

  const changeLanguage = (newLang: LangPattern) => {
    dispatch(setLanguage(newLang));
  };

  return { language, changeLanguage };
};
