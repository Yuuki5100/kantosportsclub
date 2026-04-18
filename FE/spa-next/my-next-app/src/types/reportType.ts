// src/types/reportType.ts
type reportType = {
  description: string,
  reportId: number,
  reportName: string,
  templateFile: string,
  outputFormat :number,
  updatedAt: Date,
  updatedBy: Date
}

export type reportListType = {
  data: reportType[],
  success: boolean,
  error: object | null,
};


// レポートの型定義
export type excelType = {
  data: string,
  success: boolean,
  error: object | null,
}
