import { apiService } from "@/api/apiService";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { useFetch } from "@/hooks/useApi";

export type MailTemplatePayload = {
  templateName: string;
  locale: string;
  subject: string;
  body: string;
};

export type MailTemplateResponse = {
  data: MailTemplatePayload[];
  success: boolean;
  error?: string;
};

export const useMailTemplateList = () => {
  return useFetch<MailTemplateResponse>(
    "mail-template",
    API_ENDPOINTS.MAIL_TEMPLATES.GET,
    { limit: 180000 },
    {
      useCache: true,
    }
  );
};

export const updateMailTemplateApi = async (
  templateName: string,
  payload: MailTemplatePayload
): Promise<void> => {
  await apiService.put(`api/mail-templates/${templateName}`, payload);
};

export const reloadMailTemplatesApi = async (): Promise<void> => {
  await apiService.post(API_ENDPOINTS.MAIL_TEMPLATES.RELOAD, {});
};
