import { RowValidationResult } from '../types';
import type { HeaderDefinition } from '../types'; // HeaderDefinition → ColumnSchema に変更
import { isValidByType } from './typeValidators';
import { getMessage, MessageCodes } from '@/message';

/**
 * CSVファイルのデータ行をスキーマ定義に基づいて検証する関数
 */
export const validateCsvRows = async (
  file: File,
  schema: HeaderDefinition[],
  delimiter: string = ',',
  maxRows?: number,
  lang?: Record<string, string>
): Promise<RowValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result as string;
      const rawLines = text.split(/\r?\n/);
      const header = rawLines[0].split(delimiter).map((h) => h.trim());
      const dataLines = rawLines.slice(1);

      const results: RowValidationResult = { warnings: [], errors: [] };

      dataLines.forEach((line, index) => {
        const rowNum = index + 2;

        if (line.trim() === '') {
          results.warnings.push(
            (lang?.EMPTY_ROW || getMessage(MessageCodes.CSV_EMPTY_ROW)).replace('{row}', String(rowNum))
          );
          return;
        }

        const values = line.split(delimiter).map((v) => v.trim());
        const row = Object.fromEntries(header.map((key, idx) => [key, values[idx] ?? '']));

        schema.forEach(
          ({ field, required, type, pattern, validationMessage, enumValues }) => {
            const value = row[field];

            if (required && (!value || value === '')) {
              results.errors.push(
                (lang?.REQUIRED || getMessage(MessageCodes.CSV_REQUIRED))
                  .replace('{key}', field)
                  .replace('{row}', String(rowNum))
              );
              return;
            }

            if (value) {
              if (type && !isValidByType(value, type)) {
                results.errors.push(
                  (lang?.INVALID_TYPE || getMessage(MessageCodes.CSV_INVALID_TYPE))
                    .replace('{key}', field)
                    .replace('{row}', String(rowNum))
                );
                return;
              }

              if (enumValues && !enumValues.includes(value)) {
                results.errors.push(
                  validationMessage ||
                  (lang?.ENUM_MISMATCH ||
                    getMessage(MessageCodes.CSV_ENUM_MISMATCH))
                    .replace('{key}', field)
                    .replace('{value}', value)
                    .replace('{row}', String(rowNum))
                );
                return;
              }

              if (typeof pattern === 'function' && !pattern(value)) {
                results.errors.push(
                  validationMessage ||
                  (lang?.INVALID || getMessage(MessageCodes.CSV_INVALID_VALUE))
                    .replace('{key}', field)
                    .replace('{row}', String(rowNum))
                );
                return;
              }

              if (pattern instanceof RegExp && !pattern.test(value)) {
                results.errors.push(
                  validationMessage ||
                  (lang?.INVALID_FORMAT || getMessage(MessageCodes.CSV_INVALID_FORMAT))
                    .replace('{key}', field)
                    .replace('{row}', String(rowNum))
                );
                return;
              }
            }
          }
        );
      });

      resolve(results);
    };

    reader.onerror = () =>
      resolve({
        warnings: [],
        errors: [lang?.READ_ERROR || getMessage(MessageCodes.FILE_READ_ERROR)]
      });

    reader.readAsText(file);
  });
};

export type { RowValidationResult };
