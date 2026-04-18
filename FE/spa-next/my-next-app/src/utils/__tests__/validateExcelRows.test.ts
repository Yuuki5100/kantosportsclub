import * as XLSX from 'xlsx';
import { validateExcelRows } from '@/utils/file/validators/validateExcelRows';
import { createMockExcelFile } from './helpers/mockExcelFile';
import type { HeaderDefinition } from '@/utils/file/types';

const dummySchema: HeaderDefinition[] = [
  { field: 'id', required: true, type: 'number', repository: '' },
  { field: 'email', required: true, type: 'string', repository: '' },
  { field: 'name', required: true, type: 'string', repository: '' },
  { field: 'repository', required: true, type: 'string', repository: '' },
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

describe('validateExcelRows', () => {
  test('正常系（全行バリデーションOK）', async () => {
    const file = createMockExcelFile([
      ['id', 'name', 'email', 'repository'],
      ['1', 'Alice', 'alice@example.com', 'git'],
    ]);
    const res = await validateExcelRows(file, dummySchema, 0, undefined, dummyLang);
    expect(res.errors).toHaveLength(0);
    expect(res.warnings).toHaveLength(0);
  });

  test('必須項目が未入力でエラーになる', async () => {
    const file = createMockExcelFile([
      ['id', 'name', 'email', 'repository'],//header
      ['', 'name', 'email', 'repository'],
      ['', '', '', ''],
    ]);
    const res = await validateExcelRows(file, dummySchema, 0, undefined, dummyLang);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors.some((e) => e.includes('未入力'))).toBe(true);
  });

  test('空行が警告として検出される', async () => {
    const file = createMockExcelFile([
      ['id', 'name', 'email', 'repository'],
      ['id', 'Taro', 'taro@example.com', 'git'],
      [''], // 完全に空行
      ['id', 'Taro', 'taro@example.com', 'git'],
    ]);
    const res = await validateExcelRows(file, dummySchema, 0, undefined, dummyLang);
    expect(res.warnings.some((w) => w.includes('空行検出'))).toBe(true);
  });

  test('行数超過で警告される', async () => {
    const rows = [['id', 'name', 'email', 'repository']];
    for (let i = 0; i < 1003; i++) {
      rows.push([`${i}`, `User${i}`, `user${i}@example.com`, `repo${i}`]);
    }
    const file = createMockExcelFile(rows);
    const res = await validateExcelRows(file, dummySchema, 0, 1000, dummyLang);

    // ✅ エラーに対して検証
    expect(res.errors.some((e) => e.includes('行数上限'))).toBe(true);
  });

  test('Excel解析エラーが検出される', async () => {
    await jest.isolateModulesAsync(async () => {
      const spy = jest.spyOn(await import('xlsx'), 'read').mockImplementation(() => {
        throw new Error('forced parse error');
      });

      const { validateExcelRows } = await import('@/utils/file/validators/validateExcelRows');

      const file = new File([new Uint8Array([0x01])], 'broken.xlsx');
      (file as any).__forceParseError = true;

      const res = await validateExcelRows(file, dummySchema, 0, undefined, dummyLang);
      expect(res.errors).toContain(dummyLang.PARSE_ERROR);

      expect(res.errors).toContain(dummyLang.PARSE_ERROR);

      spy.mockRestore();
    });
  });

  test('読み取りエラーが処理される', async () => {
    const original = global.FileReader;
    class MockReader {
      onerror: ((e: any) => void) | null = null;
      readAsArrayBuffer() {
        this.onerror?.({} as any);
      }
    }
    global.FileReader = MockReader as any;
    const file = new File([], 'broken.xlsx');
    const res = await validateExcelRows(file, dummySchema, 0, undefined, dummyLang);
    expect(res.errors.some((e) => e.includes(dummyLang.READ_ERROR))).toBe(true);
    global.FileReader = original;
  });
});


test('必須未入力・列数過多・空欄セルの複合エラーを検出する', async () => {
  const file = createMockExcelFile([
    ['id', 'name', 'email', 'repository'], // header（4列）
    ['1', '', '', 'git', 'EXTRA'], // 2列目: name, email が空欄（必須）、列数超過
    ['', '', '', ''],              // 3列目: 完全に空欄（空行）
    ['2', 'Taro', '', ''],         // 4列目: email/repository が空欄（必須）
  ]);

  const res = await validateExcelRows(file, dummySchema, 0, undefined, dummyLang);

  // ✅ エラー数を確認（必須チェックが複数行に発生）
  expect(res.errors).toEqual(
    expect.arrayContaining([
      expect.stringContaining("❌ 必須項目 'name' が未入力"),
      expect.stringContaining("❌ 必須項目 'email' が未入力"),
      expect.stringContaining("❌ 必須項目 'repository' が未入力"),
    ])
  );

  // ✅ 空行警告が含まれる
  expect(res.warnings).toEqual(
    expect.arrayContaining([
      expect.stringContaining('⚠️ 空行検出'),
    ])
  );

  // ✅ 列数過多自体はエラーにはならないが、値は無視されていないことを確認してもよい（データとして読み込まれている）
  // → schema にないフィールドは無視されるので、仕様上ここでの「列数過多」は未定義列の無視という挙動になる
  //    → 警告やエラーが出ないのは仕様通り（必要であればチェックを追加する設計）

});

test('maxLength超過の値がエラーになる', async () => {
  const schemaWithMaxLength: HeaderDefinition[] = [
    { field: 'id', required: true, type: 'number', repository: '' },
    { field: 'name', required: true, type: 'string', repository: '', maxLength: 5 },
    { field: 'email', required: true, type: 'string', repository: '' },
    { field: 'repository', required: true, type: 'string', repository: '' },
  ];

  const file = createMockExcelFile([
    ['id', 'name', 'email', 'repository'],
    ['1', 'ThisNameIsTooLong', 'user@example.com', 'git'],
  ]);

  const res = await validateExcelRows(file, schemaWithMaxLength, 0, undefined, dummyLang);

  // maxLength 超過の name に対するエラーがあること
  expect(res.errors).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/name.*文字数.*超えている/), // dummyLang を使ってもよい
    ])
  );
});

test('maxLength違反時に validationMessage を優先して表示する', async () => {
  const schemaWithValidationMessage: HeaderDefinition[] = [
    {
      field: 'name',
      required: true,
      type: 'string',
      repository: '',
      maxLength: 4,
      validationMessage: '🔴 name が長すぎます（上限4文字）',
    },
  ];

  const file = createMockExcelFile([
    ['name'],
    ['長い名前だよ'],
  ]);

  const res = await validateExcelRows(file, schemaWithValidationMessage, 0, undefined, dummyLang);

  expect(res.errors).toEqual(
    expect.arrayContaining([
      '🔴 name が長すぎます（上限4文字）',
    ])
  );
});


test('正規表現 pattern にマッチしない場合にエラーになる', async () => {
  const schemaWithPattern: HeaderDefinition[] = [
    {
      field: 'code',
      required: true,
      type: 'string',
      repository: '',
      pattern: /^[A-Z]{3}\d{4}$/, // 例: ABC1234
    },
  ];

  const file = createMockExcelFile([
    ['code'],
    ['abc-1234'], // ❌ 小文字 + ハイフン → マッチしない
    ['XYZ12345'], // ❌ 桁数オーバー
    ['ABC1234'],  // ✅ 正常
  ]);

  const res = await validateExcelRows(file, schemaWithPattern, 0, undefined, dummyLang);

  // ❌ 不正な2行目・3行目に対してエラーが出ていること
  expect(res.errors).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/code.*形式.*不正/),
    ])
  );

  // ✅ 4行目は正常なので、error がそれ以上増えていないこと
  expect(res.errors.length).toBe(2); // 不正データ2行分のみエラー
});


test('patternが文字列だった場合に正しく評価される', async () => {
  const schemaWithStringPattern: HeaderDefinition[] = [
    {
      field: 'code',
      required: true,
      type: 'string',
      repository: '',
      pattern: '^[A-Z]{3}\\d{4}$' as unknown as RegExp, // ←強制キャスト
    },
  ];

  const file = createMockExcelFile([
    ['code'],
    ['abc1234'], // ❌ invalid
  ]);

  const res = await validateExcelRows(file, schemaWithStringPattern, 0, undefined, dummyLang);

  expect(res.errors.some((e) => e.includes('形式が不正'))).toBe(true);
});
