import { mockMailTemplates } from "./data";

export const mockGetMailTemplates = async () => {
  return {
    success: true,
    data: mockMailTemplates,
    error: null,
  };
};

export const mockUpdateMailTemplate = async () => {
  return { success: true };
};

export const mockReloadMailTemplates = async () => {
  return { success: true };
};

