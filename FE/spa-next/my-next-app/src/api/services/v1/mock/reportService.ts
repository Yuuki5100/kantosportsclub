import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { excelType, reportListType } from "@/types/reportType";
import type { JobStatusResponse } from "@/hooks/usePollingStatus";
import {
  mockExportReportFile,
  mockGetReportList,
  mockGetReportPolling,
  mockKickReportJob,
} from "@/mocks/report/handlers";

export const useReportList = () => {
  return useQuery<reportListType, Error>({
    queryKey: ["report_list", Date.now()],
    queryFn: () => mockGetReportList(),
  });
};

type ReportFileRequest = {
  reportId: number;
};

export const useFetchReportFile = (
  exportTarget: "excelFile" | "pdfFile" | "csvFile"
) => {
  return useMutation<excelType, Error, ReportFileRequest>({
    mutationKey: [`file_download_${exportTarget}`],
    mutationFn: async () => mockExportReportFile(exportTarget),
  });
};

type ReportJobRequest = {
  reportId: number;
  exportTarget: "excelUrl" | "pdfUrl" | "csvUrl";
};

type ReportJobResponse = {
  data: string;
};

export const useKickReportJob = () => {
  return useMutation<ReportJobResponse, Error, ReportJobRequest>({
    mutationKey: ["kick_report_job"],
    mutationFn: async () => mockKickReportJob(),
  });
};

export const useReportPollingStatus = (jobId: string | null, enabled: boolean) => {
  return useQuery<JobStatusResponse, Error>({
    queryKey: ["report_polling", jobId, enabled, Date.now()],
    queryFn: () => mockGetReportPolling(),
    enabled: enabled && !!jobId,
    refetchInterval: enabled ? 1000 : false,
  });
};

export const useFetchReportURL = (jobId: string) => {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"RUNNING" | "COMPLETED" | "FAILED" | null>("RUNNING");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { data, error } = useReportPollingStatus(jobId, status === "RUNNING");

  useEffect(() => {
    if (data?.data.status === "COMPLETED") {
      setUrl(data.data.url ?? null);
      setStatus("COMPLETED");
      setIsLoading(false);
    } else if (data?.data.status === "FAILED") {
      setStatus("FAILED");
      setIsLoading(false);
    }
  }, [data]);

  return { url, isLoading, error };
};
