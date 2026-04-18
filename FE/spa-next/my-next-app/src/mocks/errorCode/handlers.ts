import { mockErrorCodes, MockErrorCode } from "./data";

export const mockGetErrorCodes = async () => {
  return {
    success: true,
    data: mockErrorCodes,
    error: null,
  };
};

export const mockAddErrorCode = async (_data: MockErrorCode) => {
  return { success: true };
};

export const mockUpdateErrorCode = async () => {
  return { success: true };
};

export const mockReloadErrorCodes = async () => {
  return { success: true };
};

