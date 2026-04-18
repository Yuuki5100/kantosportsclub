// src/hooks/__tests__/useSidebar.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSidebar } from '../useSidebar';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedMenu, clearSelectedMenu } from '@/slices/sidebarSlice';

jest.mock('react-redux');
jest.mock('@/slices/sidebarSlice');

describe('useSidebar フック', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('selectedMenuKey が Redux から取得できる', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ sidebar: { selectedMenuKey: 'menu1' } })
    );

    const { result } = renderHook(() => useSidebar());

    expect(result.current.selectedMenuKey).toBe('menu1');
  });

  it('selectMenu を呼ぶと setSelectedMenu が dispatch される', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue('menu1');
    (setSelectedMenu as unknown as jest.Mock).mockReturnValue({ type: 'setSelectedMenu' });

    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.selectMenu('menu2');
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'setSelectedMenu' });
  });

  it('clearMenuSelection を呼ぶと clearSelectedMenu が dispatch される', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue('menu1');
    (clearSelectedMenu as unknown as jest.Mock).mockReturnValue({ type: 'clearSelectedMenu' });

    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.clearMenuSelection();
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'clearSelectedMenu' });
  });
});
