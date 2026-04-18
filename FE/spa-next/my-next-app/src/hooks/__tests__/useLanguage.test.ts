// src/hooks/__tests__/useLanguage.test.ts
import { renderHook } from '@testing-library/react';
import { useLanguage } from '../useLanguage';
import { useSelector } from 'react-redux';

jest.mock('react-redux');

describe('useLanguage フック', () => {
  const mockUseSelector = useSelector as unknown as jest.Mock;

  const langObj = {
    en: { hello: 'Hello', bye: 'Goodbye' },
    ja: { hello: 'こんにちは', bye: 'さようなら' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Redux の language に応じたオブジェクトを返す (en)', () => {
    mockUseSelector.mockReturnValue('en');

    const { result } = renderHook(() => useLanguage(langObj));

    expect(result.current).toEqual(langObj.en);
  });

  it('Redux の language に応じたオブジェクトを返す (ja)', () => {
    mockUseSelector.mockReturnValue('ja');

    const { result } = renderHook(() => useLanguage(langObj));

    expect(result.current).toEqual(langObj.ja);
  });

  it('存在しない language の場合は en を返す', () => {
    mockUseSelector.mockReturnValue('fr');

    const { result } = renderHook(() => useLanguage(langObj));

    expect(result.current).toEqual(langObj.en);
  });
});
