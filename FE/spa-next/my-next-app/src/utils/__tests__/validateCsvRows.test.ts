/// <reference types="jest" />
import { validateCsvRows } from '@/utils/file/validators/validateCsvRows';
import type { HeaderDefinition, RowValidationResult } from '@/utils/file/types';
import { expect, describe, test } from '@jest/globals';

const schema: HeaderDefinition[] = [
  {
    field: 'id', required: true, type: 'number',
    repository: ''
  },
  {
    field: 'name', required: true, type: 'string',
    repository: ''
  },
];

const dummyLang = {
  REQUIRED: '必須: {key}',
  EMPTY_ROW: '空行検出: {row} 行目',
  READ_ERROR: '読み取りエラー',
  INVALID_TYPE: '型不一致: {key}',
};

function createCsvFile(content: string): File {
  return new File([content], 'test.csv', { type: 'text/csv' });
}

describe('validateCsvRows', () => {
  test('正常系（全行バリデーションOK）', async () => {
    const file = createCsvFile('id,name\n1,Taro\n2,Jiro');
    const result = await validateCsvRows(file, schema, ',', undefined, dummyLang);
    expect(result.errors).toHaveLength(0);
  });

  test('必須項目未入力でエラー', async () => {
    const file = createCsvFile('id,name\n1,\n2,Hanako');
    const result = await validateCsvRows(file, schema, ',', undefined, dummyLang);
    expect(result.errors).toContain('必須: name');
  });

  test('空行が警告として検出される', async () => {
    const file = createCsvFile('id,name\n\n1,John\n');
    const result = await validateCsvRows(file, schema, ',', undefined, dummyLang);
    expect(result.warnings).toContain('空行検出: 2 行目');
  });

  test('ファイル読み取りエラーが処理される', async () => {
    const file = new File([], 'bad.csv');
    const mock = jest.spyOn(FileReader.prototype, 'readAsText');
    mock.mockImplementation(function (this: FileReader) {
      const errorEvent = new ProgressEvent('error') as ProgressEvent<FileReader>;
      setTimeout(() => this.onerror?.(errorEvent), 0);
    });

    const result = await validateCsvRows(file, schema, ',', undefined, dummyLang);
    expect(result.errors).toContain('読み取りエラー');
    mock.mockRestore();
  });

});
