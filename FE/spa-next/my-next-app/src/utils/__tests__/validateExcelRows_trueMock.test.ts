// src/utils/file/validators/validateExcelRows.ts
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    decode_range: jest.fn(),
    encode_cell: jest.fn(),
    aoa_to_sheet: jest.fn(),
  },
}));

import * as XLSX from 'xlsx';
import { RowValidationResult } from '@/utils/file/types';
import type { HeaderDefinition } from '@/utils/file/types';
import { expect, describe, test } from '@jest/globals';

// src/utils/__tests__/validateExcelRows.test.ts

import { validateExcelRows } from '@/utils/file/validators/validateExcelRows';
import { createMockExcelFile } from './helpers/mockExcelFile';


const dummySchema: HeaderDefinition[] = [
  {
    field: 'id', required: true, type: 'number',
    repository: ''
  },
  {
    field: 'email', required: true, type: 'string',
    repository: ''
  },
  {
    field: 'name', required: true, type: 'string',
    repository: ''
  },
  {
    field: 'repository', required: true, type: 'string',
    repository: ''
  }
];

const dummyLang = {
  REQUIRED: "❌ 必須項目 '{key}' が未入力: {row} 行目",
  INVALID: "❌ 項目 '{key}' の値が無効です: {row} 行目",
  INVALID_FORMAT: "❌ 項目 '{key}' の形式エラー: {row} 行目",
  EMPTY_ROW: "⚠️ 空行検出: {row} 行目",
  MAX_ROW_EXCEEDED: "⚠️ 行数上限 ({max}行) を超えています（{actual}行）",
  PARSE_ERROR: '🚨 Excelファイル解析中にエラーが発生しました',
  READ_ERROR: '🚨 Excelファイルの読み取りエラー',
};

describe('xlsxモック有りテスト群', () => {
  test('Excel解析エラーが検出される（XLSX.readで例外）', async () => {
    // XLSX.read を throw させるモック
    (XLSX.read as jest.Mock).mockImplementation(() => {
      throw new Error('Parsing failed');
    });

    const mockFile = new File(['dummy content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fakeReader: Partial<FileReader> = {
      readAsArrayBuffer: jest.fn(function (this: FileReader, blob: Blob) {
        // 非同期的に onload を発火（次のtickで）
        setTimeout(() => {
          if (this.onload) {
            // `result` をセットして呼び出す
            (this as any).result = new ArrayBuffer(8); // 適当なバッファ
            this.onload({} as ProgressEvent<FileReader>);
          }
        }, 0);
      }),
    };

    const mockFileReaderConstructor = jest.fn(() => fakeReader);

    // FileReader の静的プロパティを追加（必要に応じて）
    Object.assign(mockFileReaderConstructor, {
      EMPTY: 0,
      LOADING: 1,
      DONE: 2,
    });

    // グローバルの FileReader をモック差し替え
    global.FileReader = mockFileReaderConstructor as unknown as typeof FileReader;

    const result = await validateExcelRows(mockFile, []);

    expect(result.errors).toEqual(['🚨 Excelファイル解析中にエラーが発生しました']);
    expect(result.warnings).toEqual([]);
  });

  test('Excel解析エラーが検出される（読み込み成功だが戻り値が壊れている）', async () => {
    const originalFileReader = global.FileReader;

    class MockReader {
      onerror: ((e: any) => void) | null = null;
      onload: ((e: any) => void) | null = null;
      readAsArrayBuffer() {
        // 明示的に非同期でエラーを返す（onerror呼び出し）
        setTimeout(() => {
          this.onerror?.(new ProgressEvent('error'));
        }, 0);
      }
    }

    global.FileReader = MockReader as any;

    const file = new File([], 'broken.xlsx');

    const res = await new Promise<RowValidationResult>((resolve) => {
      // validateExcelRowsがPromiseでラップされてる場合、awaitでOK
      validateExcelRows(file, dummySchema, 0, undefined, dummyLang).then(resolve);
    });

    expect(res.errors.some(e => e.includes(dummyLang.READ_ERROR))).toBe(true);

    global.FileReader = originalFileReader; // 後片付け
  });

  test('読み取りエラーが処理される', async () => {
    const original = global.FileReader;
    class MockReader {
      onerror: ((e: any) => void) | null = null;
      readAsArrayBuffer() { this.onerror?.({} as any); }
    }
    global.FileReader = MockReader as any;
    const file = new File([], 'broken.xlsx');
    const res = await validateExcelRows(file, dummySchema, 0, undefined, dummyLang);
    expect(res.errors.some(e => e.includes(dummyLang.READ_ERROR))).toBe(true);
    global.FileReader = original;
  });
});
