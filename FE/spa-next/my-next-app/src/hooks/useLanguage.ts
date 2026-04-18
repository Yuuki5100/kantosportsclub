import { useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { LangPattern } from '@/slices/langSlice';

export function useLanguage<T extends Record<LangPattern, Record<string, string>>>(
  langObj: T
): Record<string, string> {
  const language = useAppSelector((state: RootState) => state.lang.language);
  return langObj[language as keyof T] ?? langObj["en"];
}
