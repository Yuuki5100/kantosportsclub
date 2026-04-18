import { expect, jest, test } from '@jest/globals';
import { deleteFlgText } from '@/components/CRJ/deleteFlgText';

describe('deleteFlgText', () => {
  test('trueの場合、"YES"を返す', () => {
    expect(deleteFlgText(true)).toBe('YES');
  });

  test('falseの場合、"NO"を返す', () => {
    expect(deleteFlgText(false)).toBe('NO');
  });

  test('undefinedの場合、空文字を返す', () => {
    expect(deleteFlgText()).toBe('');
  });
});
