import { expect, jest } from '@jest/globals';
import reducer, { setSelectedMenu, clearSelectedMenu } from '@/slices/sidebarSlice';

describe('sidebarSlice', () => {
  const initialState = {
    selectedMenuKey: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle setSelectedMenu', () => {
    const nextState = reducer(initialState, setSelectedMenu('user-management'));
    expect(nextState).toEqual({
      selectedMenuKey: 'user-management',
    });
  });

  it('should handle clearSelectedMenu', () => {
    const modifiedState = {
      selectedMenuKey: 'some-key',
    };
    const nextState = reducer(modifiedState, clearSelectedMenu());
    expect(nextState).toEqual({
      selectedMenuKey: null,
    });
  });
});
