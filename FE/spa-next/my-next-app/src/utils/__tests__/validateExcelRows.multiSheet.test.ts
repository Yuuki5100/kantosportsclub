// src/utils/__tests__/validateExcelRows.multiSheet.test.ts

import { validateExcelRows } from '@/utils/file/validators/validateExcelRows';
import { createMockExcelFileWithSheets } from './helpers/mockExcelFile';
import type { HeaderDefinition } from '@/utils/file/types';

const lang = {
  REQUIRED: "❌ '{key}' 未入力: {row} 行目",
  INVALID: "❌ '{key}' の値が無効です: {row} 行目",
  INVALID_FORMAT: "❌ '{key}' の形式エラー: {row} 行目",
  EMPTY_ROW: '⚠️ 空行検出: {row} 行目',
  MAX_ROW_EXCEEDED: '⚠️ 行数上限 ({max}行) を超えています（{actual}行）',
  PARSE_ERROR: '🚨 Excelファイル解析中にエラーが発生しました',
  READ_ERROR: '🚨 Excelファイルの読み取りエラー',
  SHEET_NOT_FOUND: '🚨 指定されたシートが存在しません: {sheet}',
};

const schema: HeaderDefinition[] = [
  { field: 'id', required: true, type: 'number', sheetName: 'Users', repository: '' },
  { field: 'name', required: true, type: 'string', sheetName: 'Users', repository: '' },
  { field: 'email', required: true, type: 'string', sheetName: 'Users', repository: '' },
  { field: 'repository', required: true, type: 'string', sheetName: 'Users', repository: '' }, // ★ これ
  { field: 'payment_id', required: true, type: 'string', sheetName: 'Payments', repository: '' },
  { field: 'amount', required: true, type: 'number', sheetName: 'Payments', repository: '' },
];

describe('validateExcelRows - multi sheet', () => {
  test('複数シート：Users と Payments の両方でバリデーションが通る', async () => {
    const file = createMockExcelFileWithSheets({
      Users: [
        ['id', 'name', 'email', 'repository'],
        ['1', 'Taro', 'taro@example.com', 'user'],
      ],
      Payments: [
        ['payment_id', 'amount'],
        ['P001', '1500'],
      ],
    });

    const usersSchema = schema.filter((s) => s.sheetName === 'Users');
    const paymentsSchema = schema.filter((s) => s.sheetName === 'Payments');

    const usersResult = await validateExcelRows(file, usersSchema, 0, undefined, lang, 'Users');
    const paymentsResult = await validateExcelRows(
      file,
      paymentsSchema,
      0,
      undefined,
      lang,
      'Payments'
    );

    expect(usersResult.errors).toHaveLength(0);
    expect(paymentsResult.errors).toHaveLength(0);
  });

  test('指定シートで必須項目が未入力 → エラーになる', async () => {
    const file = createMockExcelFileWithSheets({
      Users: [
        ['id', 'name', 'email', 'repository'],
        ['a', '', 'a', 'user'],
      ],
      Payments: [
        ['payment_id', 'amount'],
        ['P001', '1500'],
      ],
    });

    const usersSchema = schema.filter((s) => s.sheetName === 'Users');

    const result = await validateExcelRows(file, usersSchema, 0, undefined, lang, 'Users');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes('未入力'))).toBe(true);
  });

  test('存在しないシートを指定した場合はエラー', async () => {
    const file = createMockExcelFileWithSheets({
      Users: [['id', 'name', 'email']],
    });

    const usersSchema = schema.filter((s) => s.sheetName === 'Users');

    const result = await validateExcelRows(file, usersSchema, 0, undefined, lang, 'NotExist');

    const expectedMessage = (
      lang.SHEET_NOT_FOUND || '🚨 指定されたシートが存在しません: {sheet}'
    ).replace('{sheet}', 'NotExist');

    expect(result.errors).toContain(expectedMessage);
  });
});
