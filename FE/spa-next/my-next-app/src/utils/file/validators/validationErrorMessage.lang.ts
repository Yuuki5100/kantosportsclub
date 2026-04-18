// validationErrorMessage.lang.ts

const validationErrorMessageJa: Record<string, string> = {
  PARSE_ERROR: '🚨 Excelファイル解析中にエラーが発生しました',
  READ_ERROR: '🚨 Excelファイルの読み取りエラー',
  SHEET_NOT_FOUND: '🚨 指定されたシート「{sheet}」が存在しないため、取込できません。',
  EMPTY_ROW: '⚠️ 空行検出。(行番号：{row})',
  MAX_ROW_EXCEEDED: '取込可能レコード件数({max}件)を超過しているため、取込できません。（{actual}件）',
  REQUIRED: '{field}は必須項目です。{row}',
  INVALID_ENUM: '{field}の設定値が不正のため、取込できません。{row}',
  INVALID_PATTERN: '{field}の形式が不正のため、取込できません。{row}',
  INVALID_VALUE: '{field}の値が無効のため、取込できません。{row}',
  INVALID_NUMBER: '{field}の型が不正のため、取込できません。{row}',
  INVALID_DATE: '{field}が有効な日付ではないため、取込できません。{row}',
  HEADER_NOT_FOUND: 'ヘッダの内容が不正です、もう一度Excelファイルを取得してください。',
  HEADER_EXTRA: '余分なヘッダーが含まれています: {extra}',
  HEADER_MISSING: 'ヘッダの内容が不正です、もう一度Excelファイルを取得してください。',
  EXCEED_MAX_LENGTH: '{field}の文字数が上限({max}文字)を超えているため、取込できません。{row}',
  INVALID_REGEX: '{field}の正規表現パターンが不正なため、取込できません。{row}',
  HEADER_MISMATCH: 'ヘッダーがテンプレートと一致しません。期待: {expected} / 実際: {actual}'

};

export default validationErrorMessageJa;
