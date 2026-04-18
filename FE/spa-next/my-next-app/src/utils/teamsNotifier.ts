// src/utils/teamsNotifier.ts
import { apiService } from "@/api/apiService";
import { getLogger } from "@/utils/logger";

export const sendErrorToTeams = async (
  error: Error,
  context?: string
): Promise<void> => {
  const logger = getLogger(); // ← 遅延取得（循環参照回避）

  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    logger.error("TEAMS_WEBHOOK_URL is not defined.");
    return;
  }

  const payload = {
    text: `**Application Error Notification**
**Error:** ${error.message}
**Context:** ${context || "N/A"}
**Stack Trace:** ${error.stack || "No stack trace available."}`,
  };

  try {
    await apiService.post(webhookUrl, payload);
  } catch (sendError) {
    logger.error("Failed to send error notification to Teams:", sendError);
  }
};
