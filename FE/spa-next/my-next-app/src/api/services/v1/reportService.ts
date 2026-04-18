import * as real from "./real/reportService";
import * as mock from "./mock/reportService";
import { selectHook } from "./serviceSelector";

export const EXPORT_ENDPOINT_MAP = real.EXPORT_ENDPOINT_MAP;

export const useReportList = selectHook(real.useReportList, mock.useReportList);
export const useFetchReportFile = selectHook(real.useFetchReportFile, mock.useFetchReportFile);
export const useKickReportJob = selectHook(real.useKickReportJob, mock.useKickReportJob);
export const useReportPollingStatus = selectHook(real.useReportPollingStatus, mock.useReportPollingStatus);
export const useFetchReportURL = selectHook(real.useFetchReportURL, mock.useFetchReportURL);
