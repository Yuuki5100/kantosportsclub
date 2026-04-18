import { expect, test } from '@jest/globals';
import { validateEmail } from '../emailValidator';

describe('emailValidator', () => {
  describe('正しい形式のメールアドレス', () => {
    test.each([
      'test@example.com',
      'user.name@example.co.jp',
      'user_name@domain.com',
      'user-name@domain-name.com',
      'user+tag@example.com',
      '1234567890@domain.com',
    ])('入力値: %s => 期待結果: true', (input) => {
      expect(validateEmail(input)).toBe(true);
    });
  });

  describe('不正な形式のメールアドレス', () => {
    test.each([
      '',
      'test',
      'test@',
      '@example.com',
      'test@example',
      'test@.com',
      'test@example.',
      'test@.example.com',
      'test@exam ple.com',
    ])('入力値: %s => 期待結果: false', (input) => {
      expect(validateEmail(input)).toBe(false);
    });
  });
});
