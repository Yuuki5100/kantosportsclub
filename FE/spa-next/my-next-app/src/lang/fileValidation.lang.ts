// src/lang/fileValidation.lang.ts

export const validationLang = {
  ja: {
    REQUIRED: "❌ 必須項目 '{key}' が未入力: {row} 行目",
    INVALID: "❌ 項目 '{key}' の値が無効です: {row} 行目",
    INVALID_FORMAT: "❌ 項目 '{key}' の形式エラー: {row} 行目",
    EMPTY_ROW: "⚠️ 空行検出: {row} 行目",
    MAX_ROW_EXCEEDED: "⚠️ 行数上限（{max}行）を超えています（{actual}行）",
    READ_ERROR: "🚨 ファイル読み取りエラー",
    PARSE_ERROR: "🚨 Excelファイルの解析中にエラーが発生しました",
    HEADER_MISSING: "❌ 欠落ヘッダー: {missing}",
    HEADER_EXTRA: "⚠️ 余分なヘッダー: {extra}",
    HEADER_NOT_FOUND: "⚠️ ヘッダー行が見つかりません（行数: {count}）",
    UNSUPPORTED_FILE_TYPE: "❌ 未対応のファイルタイプです。",
  },
  en: {
    REQUIRED: "❌ Required field '{key}' is missing at row {row}",
    INVALID: "❌ Invalid value for '{key}' at row {row}",
    INVALID_FORMAT: "❌ Invalid format for '{key}' at row {row}",
    EMPTY_ROW: "⚠️ Empty row detected at row {row}",
    MAX_ROW_EXCEEDED: "⚠️ Row limit exceeded (max {max}, actual {actual})",
    READ_ERROR: "🚨 File read error",
    PARSE_ERROR: "🚨 Error parsing Excel file",
    HEADER_MISSING: "❌ Missing headers: {missing}",
    HEADER_EXTRA: "⚠️ Extra headers: {extra}",
    HEADER_NOT_FOUND: "⚠️ Header row not found (row count: {count})",
    UNSUPPORTED_FILE_TYPE: "❌ Unsupported file type.",
  },
};
