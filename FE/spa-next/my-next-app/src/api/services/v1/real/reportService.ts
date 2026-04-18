import { useFetch, useApiMutation } from "@/hooks/useApi";
import { usePollingStatus } from "@/hooks/usePollingStatus";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { excelType, reportListType } from "@/types/reportType";
import { useEffect, useState } from "react";

/** エクスポート対象とエンドポイントのマッピング */
export const EXPORT_ENDPOINT_MAP: Record<string, string> = {
  none: "",
  excelFile: API_ENDPOINTS.REPORT.EXPORT_EXCEL_FILE,
  pdfFile: API_ENDPOINTS.REPORT.EXPORT_PDF_FILE,
  excelUrl: API_ENDPOINTS.REPORT.EXPORT_EXCEL_URL,
  pdfUrl: API_ENDPOINTS.REPORT.EXPORT_PDF_URL,
};

/**
 * 帳票マスター一覧取得用のフック（GET）
 */
export const useReportList = () => {
  return useFetch<reportListType>("report_list", API_ENDPOINTS.REPORT.GET_REPORT_MASTER_LIST);
};

type ReportFileRequest = {
  reportId: number;
};

/**
 * 帳票ファイル（Excel / PDF）取得用のMutation Hook（POST）
 */
export const useFetchReportFile = (exportTarget: "excelFile" | "pdfFile" | "csvFile") => {
  const endpoint = EXPORT_ENDPOINT_MAP[exportTarget];

  return useApiMutation<excelType, ReportFileRequest>("post", endpoint, {
    mutationKey: [`file_download_${exportTarget}`],
  });
};

type ReportJobRequest = {
  reportId: number;
  exportTarget: "excelUrl" | "pdfUrl" | "csvUrl";
};

type ReportJobResponse = {
  data: string;
};

/**
 * 帳票出力ジョブのキック用Mutation Hook（POST）
 */
export const useKickReportJob = () => {
  return useApiMutation<ReportJobResponse, ReportJobRequest>("post", "/report/job", {
    mutationKey: ["kick_report_job"],
  });
};

export const useReportPollingStatus = (jobId: string | null, enabled: boolean) => {
  return usePollingStatus(API_ENDPOINTS.REPORT.GET_REPORT_URL_POLLING, jobId, enabled);
};

/**
 * ポーリングによりジョブ完了後のURLを取得するカスタムフック
 */
export const useFetchReportURL = (jobId: string) => {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"RUNNING" | "COMPLETED" | "FAILED" | null>("RUNNING");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { data, error } = usePollingStatus(API_ENDPOINTS.REPORT.GET_REPORT_URL_POLLING, jobId, status === "RUNNING");

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
