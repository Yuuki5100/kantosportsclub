// src/utils/file/validators/validateExcelRows.ts
import * as XLSX from 'xlsx';
import { RowValidationResult } from '@/utils/file/types';
import type { HeaderDefinition } from '@/utils/file/types';
import { expect, describe, test } from '@jest/globals';

// src/utils/__tests__/validateExcelRows.test.ts

import { validateExcelRows } from '@/utils/file/validators/validateExcelRows';
import { createMockExcelFile } from './helpers/mockExcelFile';

const dummySchema: HeaderDefinition[] = [
  {
    field: 'id',
    required: true,
    type: 'number',
    repository: '',
  },
  {
    field: 'email',
    required: true,
    type: 'string',
    repository: '',
  },
  {
    field: 'name',
    required: true,
    type: 'string',
    repository: '',
  },
  {
    field: 'repository',
    required: true,
    type: 'string',
    repository: '',
  },
];

const dummyLang = {
  REQUIRED: "❌ 必須項目 '{field}' が未入力: {row} 行目",
  INVALID: "❌ 項目 '{field}' の値が無効です: {row} 行目",
  INVALID_FORMAT: "❌ 項目 '{field}' の形式エラー: {row} 行目",
  EMPTY_ROW: '⚠️ 空行検出: {row} 行目',
  MAX_ROW_EXCEEDED: '⚠️ 行数上限 ({max}行) を超えています（{actual}行）',
  PARSE_ERROR: '🚨 Excelファイル解析中にエラーが発生しました',
  READ_ERROR: '🚨 Excelファイルの読み取りエラー',
};

describe('xlsxモック無しテスト群（beforeAllで共通インポート）', () => {
  let XLSX: typeof import('xlsx');
  let validateExcelRows: typeof import('@/utils/file/validators/validateExcelRows').validateExcelRows;

  beforeAll(async () => {
    jest.unmock('xlsx');
    XLSX = await import('xlsx');
    const validateModule = await import('@/utils/file/validators/validateExcelRows');
    validateExcelRows = validateModule.validateExcelRows;
  });

  test('正常系（全行バリデーションOK）', async () => {
    const file = createMockExcelFile([
      ['id', 'name', 'email', 'repository'],
      ['1', 'Alice', 'alice@example.com', 'repo1'],
    ]);
    const res = await validateExcelRows(file, dummySchema, 0, undefined, dummyLang);
    expect(res.errors).toHaveLength(0);
    expect(res.warnings).toHaveLength(0);
  },15000);

  test('必須項目が未入力でエラーになる', async () => {
    const file = createMockExcelFile([
      ['id', 'name', 'email', 'repository'],
      ['', '', '', 'dummy'],
    ]);
    const res = await validateExcelRows(file, dummySchema, 0, undefined, dummyLang);
    expect(res.errors).toHaveLength(dummySchema.length - 1);
    for (const fieldDef of dummySchema) {
      if (fieldDef.field === 'repository') continue;
      const expected = dummyLang.REQUIRED.replace('{field}', fieldDef.field).replace('{row}', '2');
      expect(res.errors).toContain(expected);
    }
  },15000);

  test('空行が警告として検出される', async () => {
    const file = createMockExcelFile([
      ['id', 'name', 'email', 'repository'],
      ['1', 'Taro', 'taro@example.com', 'repo3'],
      ['', '', '', ''],
      ['3', 'Yuuki', 'yuuki@example.com', 'repo31'],
    ]);
    const res = await validateExcelRows(file, dummySchema, 0, undefined, dummyLang);
    const expectedWarning = dummyLang.EMPTY_ROW.replace('{row}', '3');
    expect(res.warnings).toContain(expectedWarning);
  },15000);
});
