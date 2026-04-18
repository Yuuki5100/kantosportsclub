// src/hooks/useValidationLang.ts
import { validationLang } from '@/lang/fileValidation.lang';
import { useLanguage } from './useLanguage';

export function useValidationLang(): Record<string, string> {
  return useLanguage(validationLang);
}
