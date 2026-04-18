import { reloadErrorCodesApi } from "@/api/services/v1/errorCodeService";
import { reloadMailTemplatesApi } from "@/api/services/v1/mailTemplateService";
import { reloadSystemSettingCacheApi } from "@/api/services/v1/systemSettingService";
import store from "@/store";
import { showSnackbar } from "@/slices/snackbarSlice";
import { getMessage, MessageCodes } from "@/message";

const notify = (message: string, type: "SUCCESS" | "ERROR" | "ALERT") => {
  store.dispatch(showSnackbar({ message, type }));
};

const cacheReloadUtils = async (key: string) => {
  try {
    switch (key) {
      case "settings":
        await reloadSystemSettingCacheApi();
        break;

      case "mailTemplate":
        await reloadMailTemplatesApi();
        break;

      case "errorCode":
        await reloadErrorCodesApi();
        break;

      default:
        notify(getMessage(MessageCodes.CACHE_KEY_NOT_FOUND), "ALERT");
        break;
    }

    notify(getMessage(MessageCodes.CACHE_UPDATE_SUCCESS), "SUCCESS");
  } catch (error) {
    notify(
      getMessage(MessageCodes.ERROR_OCCURRED_WITH_DETAIL, (error as Error).message),
      "ERROR"
    );
  }
};

export default cacheReloadUtils;
