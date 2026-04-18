// __tests__/formatters.test.ts
import { jest } from '@jest/globals';

describe('formatters.ts', () => {
  let formatNumber: typeof import('@/utils/formatters').formatNumber;
  let unformatNumber: typeof import('@/utils/formatters').unformatNumber;
  let formatCurrency: typeof import('@/utils/formatters').formatCurrency;
  let formatPercent: typeof import('@/utils/formatters').formatPercent;
  let formatValue: typeof import('@/utils/formatters').formatValue;

  beforeAll(async () => {
    const module = await import('@/utils/formatters');
    formatNumber = module.formatNumber;
    unformatNumber = module.unformatNumber;
    formatCurrency = module.formatCurrency;
    formatPercent = module.formatPercent;
    formatValue = module.formatValue;
  });

  describe('formatNumber', () => {
    it('数値を3桁カンマ区切りで整形', () => {
      expect(formatNumber(1234567.891)).toBe('1,234,567.89');
      expect(formatNumber('98765.4321', 3)).toBe('98,765.432');
      expect(formatNumber('abc')).toBe('abc'); // 非数値はそのまま
    });
  });

  describe('unformatNumber', () => {
    it('カンマや記号を除去して数値文字列に戻す', () => {
      expect(unformatNumber('1,234,567.89')).toBe('1234567.89');
      expect(unformatNumber('¥98,765.43')).toBe('98765.43');
      expect(unformatNumber('-12,345.6')).toBe('-12345.6');
    });
  });

  describe('formatCurrency', () => {
    it('prefix付きの通貨フォーマット', () => {
      expect(formatCurrency(1234.567)).toBe('¥1,234.57');
      expect(formatCurrency(9876.543, '$', 1)).toBe('$9,876.5');
    });
  });

  describe('formatPercent', () => {
    it('小数をパーセント表記に変換', () => {
      expect(formatPercent(0.1234)).toBe('12.3%');
      expect(formatPercent(0.9876, 2)).toBe('98.76%');
      expect(formatPercent('abc')).toBe('abc'); // 非数値はそのまま
    });
  });

  describe('formatValue', () => {
    it('formatによって適切なフォーマットを呼び出す', () => {
      expect(formatValue(1234.567, 'number')).toBe('1,234.57');
      expect(formatValue(1234.567, 'currency')).toBe('¥1,234.57');
      expect(formatValue(0.1234, 'percent')).toBe('12.34%');
      expect(formatValue('abc', 'none')).toBe('abc');
      expect(formatValue(undefined as any, 'none')).toBe('');
    });

    it('optionsのprefixやdecimalScaleを反映', () => {
      expect(formatValue(1234.567, 'currency', { prefix: '$', decimalScale: 1 })).toBe('$1,234.6');
      expect(formatValue(0.1234, 'percent', { decimalScale: 2 })).toBe('12.34%');
    });
  });
});
