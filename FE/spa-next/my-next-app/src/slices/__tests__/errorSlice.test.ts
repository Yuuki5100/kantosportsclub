import { expect, describe, it } from '@jest/globals';

describe('errorSlice reducer', () => {
  let errorReducer: any;
  let setErrorMessage: any;
  let clearErrorMessage: any;

  const initialState = { message: null };

  beforeAll(async () => {
    const md = await import('../errorSlice');
    errorReducer = md.default;
    setErrorMessage = md.setErrorMessage;
    clearErrorMessage = md.clearErrorMessage;
  });

  it('should handle initial state', () => {
    expect(errorReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setErrorMessage', () => {
    const actual = errorReducer(initialState, setErrorMessage('Test error'));
    expect(actual.message).toEqual('Test error');
  });

  it('should handle clearErrorMessage', () => {
    const stateWithError = { message: 'Test error' };
    const actual = errorReducer(stateWithError, clearErrorMessage());
    expect(actual.message).toBeNull();
  });
});
