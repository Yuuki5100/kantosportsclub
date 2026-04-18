import type { excelType, reportListType } from "@/types/reportType";
import type { JobStatusResponse } from "@/hooks/usePollingStatus";
import { mockReportFile, mockReportList } from "./data";

export const mockGetReportList = async (): Promise<reportListType> => {
  return mockReportList;
};

export const mockExportReportFile = async (label: string): Promise<excelType> => {
  return mockReportFile(label);
};

export const mockKickReportJob = async (): Promise<{ data: string }> => {
  return { data: "mock-job-001" };
};

export const mockGetReportPolling = async (): Promise<JobStatusResponse> => {
  return {
    data: {
      status: "COMPLETED",
      url: "https://example.com/mock-report.pdf",
    },
  };
};

