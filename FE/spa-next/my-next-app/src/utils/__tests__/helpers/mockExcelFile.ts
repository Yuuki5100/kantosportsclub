// src/utils/__tests__/helpers/mockExcelFile.ts

import * as XLSX from 'xlsx';

export function createMockExcelFile(
  rows: (string | number | boolean | null | undefined)[][]
): File {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new File([buf], 'test.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}




export function createMockExcelFileWithSheets(
  sheets: Record<string, string[][]>
): File {
  const workbook = XLSX.utils.book_new();

  for (const [sheetName, data] of Object.entries(sheets)) {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new File([wbout], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
