// __tests__/convertSchemaToHeaderDefinitions.test.ts
import { TemplateSchemaFromYAML } from '@/utils/file/types';

describe('convertSchemaToHeaderDefinitions', () => {
  let convertSchemaToHeaderDefinitions: typeof import('@/utils/convertSchemaToHeaderDefinitions').convertSchemaToHeaderDefinitions;

  beforeAll(async () => {
    // 動的インポート（ESModule）
    const module = await import('@/utils/convertSchemaToHeaderDefinitions');
    convertSchemaToHeaderDefinitions = module.convertSchemaToHeaderDefinitions;
  });

  it('v1構造（単一シート）を正しく変換できる', () => {
    const templateV1: TemplateSchemaFromYAML = {
      columns: [
        {
          field: 'id', name: 'ID', required: true, type: 'number',
          repository: ''
        },
        {
          field: 'name', name: '名前', required: false, enumValues: 'A,B,C',
          repository: ''
        },
      ],
      templateId: '',
      version: '',
      multiSheet: false
    };

    const result = convertSchemaToHeaderDefinitions(templateV1);

    expect(result).toEqual([
      {
        field: 'id',
        name: 'ID',
        required: true,
        type: 'number',
        repository: '', // ← ここを undefined から '' に変更
        pattern: undefined,
        validationMessage: undefined,
        enumValues: undefined,
      },
      {
        field: 'name',
        name: '名前',
        required: false,
        type: 'string',
        repository: '', // ← 同上
        pattern: undefined,
        validationMessage: undefined,
        enumValues: ['A', 'B', 'C'],
      },
    ]);

    expect(result).toEqual([
      {
        field: 'id',
        name: 'ID',
        required: true,
        type: 'number',
        repository: '', // ← ここを undefined から '' に変更
        pattern: undefined,
        validationMessage: undefined,
        enumValues: undefined,
      },
      {
        field: 'name',
        name: '名前',
        required: false,
        type: 'string',
        repository: '', // ← 同上
        pattern: undefined,
        validationMessage: undefined,
        enumValues: ['A', 'B', 'C'],
      },
    ]);
  });

  it('v2構造（複数シート）を正しく変換できる', () => {
    const templateV2: TemplateSchemaFromYAML = {
      templateId: 'v2-template',
      version: '1.0',
      multiSheet: true,
      sheets: [
        {
          sheetName: 'Sheet1',
          columns: [
            { field: 'id', name: 'ID', required: true, repository: 'main' },
            {
              field: 'status', name: 'ステータス', repository: 'main', enumValues: ['OPEN', 'CLOSED'],
              required: false
            },
          ],
        },
        {
          sheetName: 'Sheet2',
          columns: [
            {
              field: 'name', name: '名前', repository: 'main',
              required: false
            },
          ],
        },
      ],
    };

    const result = convertSchemaToHeaderDefinitions(templateV2);

    expect(result).toEqual([
      {
        field: 'id',
        name: 'ID',
        required: true,
        type: 'string',
        repository: 'main',
        pattern: undefined,
        validationMessage: undefined,
        enumValues: undefined,
        sheetName: 'Sheet1',
      },
      {
        field: 'status',
        name: 'ステータス',
        required: false,
        type: 'string',
        repository: 'main',
        pattern: undefined,
        validationMessage: undefined,
        enumValues: ['OPEN', 'CLOSED'],
        sheetName: 'Sheet1',
      },
      {
        field: 'name',
        name: '名前',
        required: false,
        type: 'string',
        repository: 'main',
        pattern: undefined,
        validationMessage: undefined,
        enumValues: undefined,
        sheetName: 'Sheet2',
      },
    ]);
  });
});
