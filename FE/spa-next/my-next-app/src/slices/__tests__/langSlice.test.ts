// src/slices/__tests__/langSlice.test.ts
import { expect } from '@jest/globals';
import langReducer, { LangState, setLanguage } from '../langSlice';

describe('langSlice reducer', () => {
  const initialState: LangState = { language: 'ja' };

  it('should handle initial state', () => {
    expect(langReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setLanguage', () => {
    const actual = langReducer(initialState, setLanguage('ja'));
    expect(actual.language).toEqual('ja');
  });
});
