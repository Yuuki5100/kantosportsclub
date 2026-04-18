import * as XLSX from 'xlsx';
import validationErrorMessageJa from './validationErrorMessage.lang';
import { getMessage, MessageCodes } from '@/message';

/**
 * Excelファイルのヘッダーを検証する非同期関数
 *
 * - 指定行のヘッダーが expectedHeaders と完全一致するか検証する（空のセルは無視）
 * - データ行（空行除外）の数が maxRows を超えていないか検証する
 */
export const validateExcelHeaders = async (
  file: File,
  expectedHeaders: string[],
  t: Record<string, string> = validationErrorMessageJa,
  headerRowIndex: number = 0,
  maxRows?: number,
  sheetName?: string
): Promise<string[] | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheet =
          sheetName && workbook.Sheets[sheetName]
            ? workbook.Sheets[sheetName]
            : workbook.Sheets[workbook.SheetNames[0]];

        if (!sheet) {
          return resolve([
            (t.SHEET_NOT_FOUND || getMessage(MessageCodes.EXCEL_SHEET_NOT_FOUND))
              .replace('{sheet}', sheetName || '未指定'),
          ]);
        }

        const range = XLSX.utils.decode_range(sheet['!ref']!);
        const errors: string[] = [];

        // ✅ 実ヘッダーを取得（空セル除外）
        const actualHeaders: string[] = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const addr = XLSX.utils.encode_cell({ c: col, r: headerRowIndex });
          const cell = sheet[addr];
          const value = cell?.v?.toString().trim();
          if (value && value !== '') {
            actualHeaders.push(value);
          }
        }

        // ✅ ヘッダー完全一致チェック（空欄除外後）
        const isHeaderMatch =
          actualHeaders.length === expectedHeaders.length &&
          actualHeaders.every((h, i) => h === expectedHeaders[i]);

        if (!isHeaderMatch) {
          const msg = (t.HEADER_MISMATCH ||
            getMessage(MessageCodes.EXCEL_HEADER_MISMATCH))
            .replace('{expected}', expectedHeaders.join(', '))
            .replace('{actual}', actualHeaders.join(', '));
          errors.push(msg);
          return resolve(errors);
        }

        // ✅ データ行数カウント（空行スキップ）
        let dataRowCount = 0;
        for (let r = headerRowIndex + 1; r <= range.e.r; r++) {
          let isEmpty = true;
          for (let c = range.s.c; c <= range.e.c; c++) {
            const cellAddress = XLSX.utils.encode_cell({ r, c });
            const cellValue = sheet[cellAddress]?.v?.toString().trim() ?? '';
            if (cellValue !== '') {
              isEmpty = false;
              break;
            }
          }
          if (!isEmpty) {
            dataRowCount++;
          }
        }

        // ✅ maxRows チェック（空行を除いた行数で）
        if (maxRows && dataRowCount > maxRows) {
          const msg = (t.MAX_ROW_EXCEEDED ||
            getMessage(MessageCodes.EXCEL_MAX_ROW_EXCEEDED))
            .replace('{max}', `${maxRows}`)
            .replace('{actual}', `${dataRowCount}`);
          errors.push(msg);
          return resolve(errors);
        }

        // ✅ エラーなし
        resolve(null);
      } catch {
        resolve([t.PARSE_ERROR || getMessage(MessageCodes.EXCEL_PARSE_ERROR)]);
      }
    };

    reader.onerror = () => {
      resolve([t.READ_ERROR || getMessage(MessageCodes.EXCEL_READ_ERROR)]);
    };

    reader.readAsArrayBuffer(file);
  });
};
