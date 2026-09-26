import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import apiClient from "@/api/apiClient";
import { Box, Font14, Font20 } from "@/components/base";
import PageContainer from "@base/Layout/PageContainer";
import colors from "@/styles/colors";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";

type CurrentNoticeItem = {
  id: number;
  title: string | null;
  locationName: string | null;
  imageUrl1: string | null;
  dateandtime: string | null;
  startHour: string | null;
  endHour: string | null;
};

const parseNoticeDate = (value: string | null): number | null => {
  if (!value) return null;
  const timestamp = Date.parse(value.replace(" ", "T"));
  return Number.isNaN(timestamp) ? null : timestamp;
};

const formatNoticeDate = (value: string | null): string => {
  if (!value) return "日時未定";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = match ? `${match[1]}/${match[2]}/${match[3]}` : value;
  return date;
};

const formatNoticeTime = (startHour: string | null, endHour: string | null): string => {
  if (startHour && endHour) return `${startHour}〜${endHour}`;
  return startHour ?? endHour ?? "時間未定";
};

const findNearestNotice = (notices: CurrentNoticeItem[]): CurrentNoticeItem | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  return notices.reduce<CurrentNoticeItem | null>((nearest, notice) => {
    const noticeTimestamp = parseNoticeDate(notice.dateandtime);
    if (noticeTimestamp === null) return nearest;
    if (!nearest) return notice;

    const nearestTimestamp = parseNoticeDate(nearest.dateandtime);
    if (nearestTimestamp === null) return notice;

    const distance = Math.abs(noticeTimestamp - todayTimestamp);
    const nearestDistance = Math.abs(nearestTimestamp - todayTimestamp);
    return distance < nearestDistance || (distance === nearestDistance && noticeTimestamp > nearestTimestamp)
      ? notice
      : nearest;
  }, null);
};

const CurrentNoticeList: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [notices, setNotices] = useState<CurrentNoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<CurrentNoticeItem[]>("/api/notices/current");
      setNotices(response.data);
    } catch (error) {
      console.error("Failed to fetch current notices:", error);
      showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "お知らせ一覧"), "ERROR");
    } finally {
      setIsLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    void fetchNotices();
  }, [fetchNotices]);

  const nearestNotice = useMemo(() => findNearestNotice(notices), [notices]);
  const handleNoticeClick = () => {
    if (nearestNotice) {
      void router.push({ pathname: "/top-page/detail", query: { id: String(nearestNotice.id) } });
    }
  };

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 32px, 1152px)", maxWidth: "95%", py: 0.75, mx: "auto" }}>
        <Box sx={{ mb: 2 }}>
          <Font20>次回開催</Font20>
          {isLoading && <Font14 sx={{ color: colors.grayDark }}>読み込み中です。</Font14>}
        </Box>

        {nearestNotice ? (
          <Card
            component="button"
            type="button"
            onClick={handleNoticeClick}
            sx={{
              display: "block",
              width: "100%",
              maxWidth: 640,
              mx: "auto",
              p: 0,
              textAlign: "left",
              border: `1px solid ${colors.commonBorderGray}`,
              cursor: "pointer",
              color: "inherit",
              transition: "background-color 0.15s ease, transform 0.15s ease",
              "&:hover": { backgroundColor: colors.grayLight },
              "&:active": { transform: "scale(0.99)" },
            }}
          >
            <CardMedia
              component="img"
              image={nearestNotice.imageUrl1 ?? "/Logo.png"}
              alt="お知らせ"
              sx={{ height: { xs: 160, sm: 220 }, objectFit: "cover", backgroundColor: colors.grayLight }}
            />
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                {nearestNotice.title ?? "お知らせ"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                日時：{formatNoticeDate(nearestNotice.dateandtime)} {formatNoticeTime(nearestNotice.startHour, nearestNotice.endHour)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                場所：{nearestNotice.locationName ?? "場所未定"}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ py: 4, textAlign: "center", color: colors.grayDark }}>
            {isLoading ? "" : "現在公開中のお知らせはありません。"}
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default CurrentNoticeList;
