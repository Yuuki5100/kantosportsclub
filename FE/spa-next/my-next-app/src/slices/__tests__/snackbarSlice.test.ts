// src/slices/__tests__/snackbarSlice.test.ts
import { expect } from '@jest/globals';
import snackbarReducer, { showSnackbar, hideSnackbar, SnackbarType } from '../snackbarSlice';

describe('snackbarSlice reducer', () => {
  const initialState = { message: null, type: null };

  it('should handle initial state', () => {
    expect(snackbarReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle showSnackbar', () => {
    const payload = { message: 'Test message', type: 'SUCCESS' as SnackbarType };
    const actual = snackbarReducer(initialState, showSnackbar(payload));
    expect(actual.message).toEqual('Test message');
    expect(actual.type).toEqual('SUCCESS');
  });

  it('should handle hideSnackbar', () => {
    const stateWithSnackbar = { message: 'Test message', type: 'ERROR' as SnackbarType };
    const actual = snackbarReducer(stateWithSnackbar, hideSnackbar());
    expect(actual.message).toBeNull();
    expect(actual.type).toBeNull();
  });
});
