import { useQuery } from "@tanstack/react-query";
import type { MailTemplatePayload, MailTemplateResponse } from "../real/mailTemplateService";
import {
  mockGetMailTemplates,
  mockReloadMailTemplates,
  mockUpdateMailTemplate,
} from "@/mocks/mailTemplate/handlers";

export const useMailTemplateList = () => {
  return useQuery<MailTemplateResponse, Error>({
    queryKey: ["mail-template", Date.now()],
    queryFn: () => mockGetMailTemplates(),
  });
};

export const updateMailTemplateApi = async (
  _templateName: string,
  _payload: MailTemplatePayload
): Promise<void> => {
  await mockUpdateMailTemplate();
};

export const reloadMailTemplatesApi = async (): Promise<void> => {
  await mockReloadMailTemplates();
};
