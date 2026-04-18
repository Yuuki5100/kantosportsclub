import type { excelType, reportListType } from "@/types/reportType";

const now = new Date();

export const mockReportList: reportListType = {
  success: true,
  error: null,
  data: [
    {
      description: "売上レポート",
      reportId: 1,
      reportName: "sales_report",
      templateFile: "sales.xlsx",
      outputFormat: 1,
      updatedAt: now,
      updatedBy: now,
    },
    {
      description: "利用状況レポート",
      reportId: 2,
      reportName: "usage_report",
      templateFile: "usage.pdf",
      outputFormat: 2,
      updatedAt: now,
      updatedBy: now,
    },
  ],
};

export const mockReportFile = (label: string): excelType => {
  const base64 = typeof window !== "undefined"
    ? btoa(label)
    : Buffer.from(label, "utf-8").toString("base64");
  return {
    success: true,
    error: null,
    data: base64,
  };
};

