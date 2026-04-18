import * as XLSX from 'xlsx';
import { validateExcelHeaders } from './validateExcelHeaders';
import { validateExcelRows } from './validateExcelRows';
import type { HeaderDefinition, RowValidationResult } from '../types';
import validationErrorMessageJa from './validationErrorMessage.lang';
import { getMessage, MessageCodes } from '@/message';

export type SheetValidationResult = {
  sheetName: string;
  headerErrors?: string[]; // ヘッダー or 行数エラー（即時中断）
  rowValidation?: RowValidationResult; // 明細行バリデーション結果
};

/**
 * 複数シートのExcelファイルをバリデーションする
 * - ヘッダー不備 / 行数超過 / 明細エラーのいずれかがある場合はその時点で中断
 */
export const validateExcelWorkbook = async (
  file: File,
  schema: HeaderDefinition[],
  expectedHeaders: string[],
  maxRows: number = 1000,
  lang: Record<string, string> = validationErrorMessageJa,
  headerRowIndex: number = 0
): Promise<SheetValidationResult[]> => {
  const results: SheetValidationResult[] = [];

  // ファイル読込（ワークブック構成）
  let workbook: XLSX.WorkBook;
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    workbook = XLSX.read(data, { type: 'array' });
  } catch {
    return [{
      sheetName: '全体',
      headerErrors: [lang.PARSE_ERROR || getMessage(MessageCodes.EXCEL_PARSE_ERROR)]
    }];
  }

  for (const sheetName of workbook.SheetNames) {
    // ステップ①: ヘッダー + 行数チェック
    const headerErrors = await validateExcelHeaders(
      file,
      expectedHeaders,
      lang,
      headerRowIndex,
      maxRows,
    );

    if (headerErrors) {
      results.push({ sheetName, headerErrors });
      break; // → 中断
    }

    // ステップ②: 明細行のバリデーション
    const rowValidation = await validateExcelRows(
      file,
      schema,
      headerRowIndex,
      maxRows,
      lang,
    );

    // ステップ③: エラーがあればここで中断
    if (rowValidation.errors.length > 0) {
      results.push({ sheetName, rowValidation });
      break;
    }

    // 成功した場合のみ次のシートへ
    results.push({ sheetName, rowValidation });
  }

  return results;
};
