// utils/handleApiError.ts
import { AxiosError } from "axios";
import { sendErrorToTeams } from "./teamsNotifier";
import { getLogger } from "./logger";
import { getMessage, MessageCodes } from "@/message";

export const handleApiError = (
  error: unknown,
  fallbackMessage = getMessage(MessageCodes.GENERIC_ERROR)
): never => {
  const logger = getLogger();
  let errorMessage = fallbackMessage;

  if (!isAxiosError(error)) {
    errorMessage = getMessage(MessageCodes.NETWORK_ERROR);
  } else {
    const { response } = error;
    const status = response?.status;
    const data = response?.data as { message?: string } | undefined;
    const serverMessage = data?.message;

    if (status === 500) {
      sendErrorToTeams(
        new Error(serverMessage || getMessage(MessageCodes.SERVER_ERROR)),
        getMessage(MessageCodes.API_ERROR_500)
      );
    }

    switch (status) {
      case 400:
        errorMessage = serverMessage || getMessage(MessageCodes.BAD_REQUEST);
        break;
      case 401:
        errorMessage = getMessage(MessageCodes.UNAUTHORIZED);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("logout"));
        }
        break;
      case 403:
        errorMessage = serverMessage || getMessage(MessageCodes.FORBIDDEN);
        break;
      case 404:
        errorMessage = serverMessage || getMessage(MessageCodes.NOT_FOUND);
        break;
      case 409:
        errorMessage = serverMessage || getMessage(MessageCodes.CONFLICT);
        break;
      case 422:
        errorMessage = serverMessage || getMessage(MessageCodes.UNPROCESSABLE);
        break;
      case 503:
        errorMessage = serverMessage || getMessage(MessageCodes.SERVICE_UNAVAILABLE);
        break;
      case 504:
        errorMessage = serverMessage || getMessage(MessageCodes.GATEWAY_TIMEOUT);
        break;
      case 507:
        errorMessage = serverMessage || getMessage(MessageCodes.INSUFFICIENT_STORAGE);
        break;
      case 100:
        errorMessage = serverMessage || getMessage(MessageCodes.LARGE_UPLOAD_STARTED);
        break;
      default:
        errorMessage = serverMessage || getMessage(MessageCodes.UNEXPECTED_ERROR);
        break;
    }
  }

  logger.error("handleApiError:", errorMessage, error);
  throw new Error(errorMessage);
};

function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === "object" &&
    err !== null &&
    "isAxiosError" in err &&
    (err as AxiosError).isAxiosError === true
  );
}
export function isApiError(obj: unknown): obj is { message: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    typeof (obj as Record<string, unknown>).message === 'string'
  );
}
