import * as XLSX from 'xlsx';
import type { HeaderDefinition, RowValidationResult } from '../types';
import validationErrorMessageJa from './validationErrorMessage.lang';
import { getMessage, MessageCodes } from '@/message';

/**
 * Excelファイルを検証する
 */
export const validateExcelRows = async (
  file: File,
  schema: HeaderDefinition[],
  headerRowIndex: number = 0,
  maxRows?: number,
  lang: Record<string, string> = validationErrorMessageJa,
  sheetName?: string
): Promise<RowValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      let workbook: XLSX.WorkBook;

      try {
        if ((file as File & { __forceParseError?: boolean }).__forceParseError) {
          throw new Error(getMessage(MessageCodes.FORCED_PARSE_ERROR));
        }

        const buffer = reader.result as ArrayBuffer;
        workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      } catch {
        return resolve({
          warnings: [],
          errors: [lang.PARSE_ERROR || getMessage(MessageCodes.EXCEL_PARSE_ERROR)],
        });
      }

      try {
        if (sheetName && !workbook.SheetNames.includes(sheetName)) {
          return resolve({
            warnings: [],
            errors: [
              (
                lang.SHEET_NOT_FOUND ||
                getMessage(MessageCodes.EXCEL_SHEET_NOT_FOUND)
              ).replace('{sheet}', sheetName),
            ],
          });
        }

        const sheet = workbook.Sheets[sheetName ?? workbook.SheetNames[0]];
        const range = XLSX.utils.decode_range(sheet['!ref']!);
        const headers: string[] = [];

        for (let c = range.s.c; c <= range.e.c; c++) {
          const addr = XLSX.utils.encode_cell({ c, r: headerRowIndex });
          const val = sheet[addr]?.v?.toString().trim() || '';
          headers.push(val);
        }

        const results: RowValidationResult = { warnings: [], errors: [] };
        let processedRows = 0;

        for (let r = headerRowIndex + 1; r <= range.e.r; r++) {
          const values: string[] = [];
          let isEmptyRow = true;

          if ((file as File & { __forceParseError?: boolean }).__forceParseError) {
            // 明示型
            throw new Error(getMessage(MessageCodes.FORCED_PARSE_ERROR));
          }

          for (let c = range.s.c; c <= range.e.c; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            const v = sheet[addr]?.v?.toString().trim() || '';
            values.push(v);
            if (v !== '') isEmptyRow = false;
          }

          if (isEmptyRow) {
            results.warnings.push(
              (lang.EMPTY_ROW || getMessage(MessageCodes.EXCEL_EMPTY_ROW)).replace('{row}', String(r + 1))
            );
            continue;
          }

          processedRows++;
          if (maxRows && processedRows > maxRows) {
            results.errors.push(
              (
                lang.MAX_ROW_EXCEEDED ||
                getMessage(MessageCodes.EXCEL_MAX_ROW_EXCEEDED)
              )
                .replace('{max}', String(maxRows))
                .replace('{actual}', String(processedRows))
            );
            break;
          }

          const rowObj = Object.fromEntries(headers.map((label, i) => [label, values[i] ?? '']));
          const filteredSchema = sheetName
            ? schema.filter((s) => s.sheetName === sheetName)
            : schema;

          filteredSchema.forEach(
            ({
              field,
              name,
              required,
              pattern,
              validationMessage,
              enumValues,
              type,
              maxLength,
            }) => {
              const raw = rowObj[field];
              const value = raw?.toString().trim() ?? '';
              const label = name || field;
              const rowNum = `${r + 1}`;

              if (required && value === '') {
                results.errors.push(
                  (lang.REQUIRED || getMessage(MessageCodes.EXCEL_REQUIRED))
                    .replace('{field}', label)
                    .replace('{row}', rowNum)
                );
                return;
              }

              if (value !== '') {
                // ✅ pattern が string の場合、RegExp に変換（try-catch 付き）
                let actualPattern = pattern;
                if (typeof actualPattern === 'string') {
                  try {
                    actualPattern = new RegExp(actualPattern);
                  } catch{
                    results.errors.push(
                      (
                        lang.INVALID_REGEX ||
                        getMessage(MessageCodes.EXCEL_INVALID_REGEX)
                      )
                        .replace('{field}', label)
                        .replace('{row}', rowNum)
                    );
                    return;
                  }
                }

                if (typeof maxLength === 'number' && value.length > maxLength) {
                  results.errors.push(
                    validationMessage ||
                      (
                        lang.EXCEED_MAX_LENGTH ||
                        getMessage(MessageCodes.EXCEL_EXCEED_MAX_LENGTH)
                      )
                        .replace('{field}', label)
                        .replace('{max}', String(maxLength))
                        .replace('{row}', rowNum)
                  );
                  return;
                }

                if (enumValues && !enumValues.includes(value)) {
                  results.errors.push(
                    validationMessage ||
                      (lang.INVALID_ENUM || getMessage(MessageCodes.EXCEL_INVALID_ENUM))
                        .replace('{field}', label)
                        .replace('{row}', rowNum)
                  );
                  return;
                }

                if (actualPattern instanceof RegExp && !actualPattern.test(value)) {
                  results.errors.push(
                    validationMessage ||
                      (lang.INVALID_PATTERN || getMessage(MessageCodes.EXCEL_INVALID_PATTERN))
                        .replace('{field}', label)
                        .replace('{row}', rowNum)
                  );
                  return;
                }

                if (typeof actualPattern === 'function' && !actualPattern(value)) {
                  results.errors.push(
                    validationMessage ||
                      (lang.INVALID_VALUE || getMessage(MessageCodes.EXCEL_INVALID_VALUE))
                        .replace('{field}', label)
                        .replace('{row}', rowNum)
                  );
                  return;
                }

                if (type === 'number' && isNaN(Number(value))) {
                  results.errors.push(
                    (lang.INVALID_NUMBER || getMessage(MessageCodes.EXCEL_INVALID_NUMBER))
                      .replace('{field}', label)
                      .replace('{row}', rowNum)
                  );
                  return;
                }

                if (type === 'date' && isNaN(Date.parse(value))) {
                  results.errors.push(
                    (lang.INVALID_DATE || getMessage(MessageCodes.EXCEL_INVALID_DATE))
                      .replace('{field}', label)
                      .replace('{row}', rowNum)
                  );
                  return;
                }
              }
            }
          );
        }

        resolve(results);
      } catch {
        resolve({
          warnings: [],
          errors: [lang.PARSE_ERROR || getMessage(MessageCodes.EXCEL_PARSE_ERROR)],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        warnings: [],
        errors: [lang.READ_ERROR || getMessage(MessageCodes.EXCEL_READ_ERROR)],
      });
    };

    reader.readAsArrayBuffer(file);
  });
};
