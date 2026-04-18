import * as real from "./real/mailTemplateService";
import * as mock from "./mock/mailTemplateService";
import { callWithMockFallback, selectHook } from "./serviceSelector";

export type { MailTemplatePayload, MailTemplateResponse } from "./real/mailTemplateService";

export const useMailTemplateList = selectHook(real.useMailTemplateList, mock.useMailTemplateList);

export const updateMailTemplateApi = (
  templateName: Parameters<typeof real.updateMailTemplateApi>[0],
  payload: Parameters<typeof real.updateMailTemplateApi>[1]
) =>
  callWithMockFallback(
    () => mock.updateMailTemplateApi(templateName, payload),
    () => real.updateMailTemplateApi(templateName, payload)
  );

export const reloadMailTemplatesApi = () =>
  callWithMockFallback(() => mock.reloadMailTemplatesApi(), () => real.reloadMailTemplatesApi());
