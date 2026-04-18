import * as real from "./real/importService";
import * as mock from "./mock/importService";
import { callWithMockFallback, selectHook } from "./serviceSelector";

export const uploadImportFileWithEndpoint = (
  endpoint: Parameters<typeof real.uploadImportFileWithEndpoint>[0],
  file: Parameters<typeof real.uploadImportFileWithEndpoint>[1],
  templateId?: Parameters<typeof real.uploadImportFileWithEndpoint>[2]
) =>
  callWithMockFallback(
    () => mock.uploadImportFileWithEndpoint(endpoint, file, templateId),
    () => real.uploadImportFileWithEndpoint(endpoint, file, templateId)
  );

export const uploadImportFile = (
  file: Parameters<typeof real.uploadImportFile>[0],
  templateId?: Parameters<typeof real.uploadImportFile>[1]
) =>
  callWithMockFallback(
    () => mock.uploadImportFile(file, templateId),
    () => real.uploadImportFile(file, templateId)
  );

export const getImportHistory = () =>
  callWithMockFallback(() => mock.getImportHistory(), () => real.getImportHistory());

export const useImportHistory = selectHook(real.useImportHistory, mock.useImportHistory);

export const getTemplateSchemaByEndpoint = (
  endpoint: Parameters<typeof real.getTemplateSchemaByEndpoint>[0],
  templateId: Parameters<typeof real.getTemplateSchemaByEndpoint>[1]
) =>
  callWithMockFallback(
    () => mock.getTemplateSchemaByEndpoint(endpoint, templateId),
    () => real.getTemplateSchemaByEndpoint(endpoint, templateId)
  );

export const getTemplateSchema = (templateId: Parameters<typeof real.getTemplateSchema>[0]) =>
  callWithMockFallback(
    () => mock.getTemplateSchema(templateId),
    () => real.getTemplateSchema(templateId)
  );

export const requestDownloadReady = (
  reportId: Parameters<typeof real.requestDownloadReady>[0],
  fileName: Parameters<typeof real.requestDownloadReady>[1],
  extension: Parameters<typeof real.requestDownloadReady>[2]
) =>
  callWithMockFallback(
    () => mock.requestDownloadReady(reportId, fileName, extension),
    () => real.requestDownloadReady(reportId, fileName, extension)
  );

export const downloadImportFile = (jobName: Parameters<typeof real.downloadImportFile>[0]) =>
  callWithMockFallback(
    () => mock.downloadImportFile(jobName),
    () => real.downloadImportFile(jobName)
  );

export const uploadFileToServer = uploadImportFile;
