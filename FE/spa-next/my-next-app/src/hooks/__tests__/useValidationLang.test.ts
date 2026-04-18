// src/hooks/__tests__/useValidationLang.test.ts
import { renderHook } from '@testing-library/react';
import { useValidationLang } from '@/hooks/useValidationLang';
import { useLanguage } from '../useLanguage';
import { validationLang } from '@/lang/fileValidation.lang';

jest.mock('../useLanguage');

describe('useValidationLang フック', () => {
  const mockUseLanguage = useLanguage as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useLanguage が返す値をそのまま返す', () => {
    const mockValue = { required: '必須', optional: '任意' };
    mockUseLanguage.mockReturnValue(mockValue);

    const { result } = renderHook(() => useValidationLang());

    expect(mockUseLanguage).toHaveBeenCalledWith(validationLang);
    expect(result.current).toEqual(mockValue);
  });
});
