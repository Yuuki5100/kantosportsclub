import { isValidByType } from '@/utils/file/validators/typeValidators';
import { expect, describe, test } from '@jest/globals';

describe('isValidByType', () => {
  describe('string 型の検証', () => {
    test('任意の文字列を許容する', () => {
      expect(isValidByType('hello', 'string')).toBe(true);
      expect(isValidByType('', 'string')).toBe(true); // 空文字も許容（requiredは別途チェック）
    });
  });

  describe('number 型の検証', () => {
    test('整数を正しく判定する', () => {
      expect(isValidByType('123', 'number')).toBe(true);
      expect(isValidByType('-456', 'number')).toBe(true);
    });

    test('小数を正しく判定する', () => {
      expect(isValidByType('0.99', 'number')).toBe(true);
      expect(isValidByType('-0.01', 'number')).toBe(true);
    });

    test('数字以外は false', () => {
      expect(isValidByType('abc', 'number')).toBe(false);
      expect(isValidByType('12a', 'number')).toBe(false);
      expect(isValidByType('', 'number')).toBe(false);
    });
  });

  describe('boolean 型の検証', () => {
    test('true/false/1/0 を許容（大文字小文字区別なし）', () => {
      expect(isValidByType('true', 'boolean')).toBe(true);
      expect(isValidByType('false', 'boolean')).toBe(true);
      expect(isValidByType('TRUE', 'boolean')).toBe(true);
      expect(isValidByType('FALSE', 'boolean')).toBe(true);
      expect(isValidByType('1', 'boolean')).toBe(true);
      expect(isValidByType('0', 'boolean')).toBe(true);
    });

    test('boolean 以外は false', () => {
      expect(isValidByType('yes', 'boolean')).toBe(false);
      expect(isValidByType('no', 'boolean')).toBe(false);
      expect(isValidByType('', 'boolean')).toBe(false);
    });
  });
});
