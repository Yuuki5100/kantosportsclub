// __tests__/formatUtils.test.ts
import { jest } from '@jest/globals';

describe('formatTimestamp', () => {
  let formatTimestamp: typeof import('@/utils/formatUtils').formatTimestamp;

  beforeAll(async () => {
    // dynamic import (ESModule対応)
    const module = await import('@/utils/formatUtils');
    formatTimestamp = module.formatTimestamp;
  });

  it('undefinedの場合は空文字を返す', () => {
    expect(formatTimestamp()).toBe('');
    expect(formatTimestamp(undefined)).toBe('');
  });

  it('Tを空白に置換して19文字まで切り取る', () => {
    const input = '2025-10-15T14:42:00.123Z';
    const expected = '2025-10-15 14:42:00';
    expect(formatTimestamp(input)).toBe(expected);
  });

  it('Tが含まれない場合は先頭19文字まで切り取る', () => {
    const input = '2025-10-15 14:42:00.123Z';
    const expected = '2025-10-15 14:42:00';
    expect(formatTimestamp(input)).toBe(expected);
  });

  it('19文字未満の文字列の場合はそのまま返す', () => {
    const input = '2025-10-15T14';
    const expected = '2025-10-15 14';
    expect(formatTimestamp(input)).toBe(expected);
  });
});
