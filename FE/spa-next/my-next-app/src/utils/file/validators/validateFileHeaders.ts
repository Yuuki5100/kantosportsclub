// src/utils/file/validators/validateFileHeaders.ts
import { FileType, HeaderValidationOptions } from '../types';
import { validateCsvHeaders } from './validateCsvHeaders';
import { validateExcelHeaders } from './validateExcelHeaders';
import { getMessage, MessageCodes } from '@/message';

/**
 * ファイルのヘッダー検証を行うユーティリティ関数
 *
 * 指定されたファイル種別（CSV または Excel）に応じて、
 * 適切な検証処理（validateCsvHeaders または validateExcelHeaders）に処理をディスパッチします。
 *
 * @param file - ユーザーがアップロードしたファイルオブジェクト
 * @param fileType - ファイルの種類を表す文字列。 'csv' または 'excel' が指定可能
 * @param options - ヘッダー検証に必要なオプション群
 *                  ・expectedHeaders: 期待されるヘッダー名の配列
 *                  ・headerRowIndex: ヘッダー行のインデックス（省略時は 0）
 *                  ・delimiter: CSVの場合の区切り文字（省略時はカンマ）
 *                  ・maxRows: 許容する最大行数（省略可能）
 * @param t - エラーメッセージの翻訳オブジェクト（メッセージテンプレート）
 *
 * @returns ヘッダーに関するエラーがあればエラーメッセージ配列、問題なければ null を返します。
 */
export const validateFileHeaders = async (
  file: File,
  fileType: FileType,
  options: HeaderValidationOptions,
  t: Record<string, string>
): Promise<string[] | null> => {
  // CSVファイルの場合の検証処理
  if (fileType === 'csv') {
    return validateCsvHeaders(
      file,
      options.expectedHeaders,              // 期待されるヘッダー配列
      t,                                    // 翻訳オブジェクト
      options.headerRowIndex ?? 0,          // ヘッダー行のインデックス（指定がない場合は0）
      options.delimiter ?? ',',             // 区切り文字（指定がなければカンマ）
      options.maxRows                       // 最大行数のオプション（ある場合のみ）
    );
  }
  // Excelファイルの場合の検証処理
  else if (fileType === 'excel') {
    return validateExcelHeaders(
      file,
      options.expectedHeaders,              // 期待されるヘッダー配列
      t,                                    // 翻訳オブジェクト
      options.headerRowIndex ?? 0,          // ヘッダー行のインデックス（指定がない場合は0）
      options.maxRows,                       // 最大行数のオプション（ある場合のみ）
      options.sheetName // ✅ 追加！
    );
  }
  // サポートしていないファイル形式の場合の処理
  return [t.UNSUPPORTED_FILE_TYPE || getMessage(MessageCodes.UNSUPPORTED_FILE_TYPE, fileType)];
};
