import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Box, Font14, Font20 } from "@/components/base";
import PageContainer from "@base/Layout/PageContainer";
import apiClient from "@/api/apiClient";
import colors from "@/styles/colors";
import type { ApiResponse } from "@/types/api";

type PlayerApiItem = {
  userId?: number | string | null;
  user_id?: number | string | null;
  userName?: string | null;
  user_name?: string | null;
  userNameJpn?: string | null;
  user_name_jpn?: string | null;
  jerseyNumber?: number | string | null;
  jersey_number?: number | string | null;
  imageUrl?: string | null;
  image_url?: string | null;
};

type PlayerItem = {
  userId: number;
  userName: string;
  userNameJpn: string;
  jerseyNumber: string;
  imageUrl: string;
};

const PLAYER_LIST_ENDPOINT = "/api/mypage/list";

const toText = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

const toNumberText = (value: number | string | null | undefined): string => {
  const text = toText(value).trim();
  return text || "-";
};

const toLinkHref = (url: string): string => {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url) || url.startsWith("/")) {
    return url;
  }
  return `https://${url}`;
};

const toPlayerDetailQuery = (item: PlayerItem) => ({
  userId: String(item.userId),
  userName: item.userName,
  userNameJpn: item.userNameJpn,
  jerseyNumber: item.jerseyNumber,
  imageUrl: item.imageUrl,
});

const toPlayerItem = (item: PlayerApiItem, index: number): PlayerItem => ({
  userId: Number(item.userId ?? item.user_id ?? index + 1),
  userName: toText(item.userName ?? item.user_name),
  userNameJpn: toText(item.userNameJpn ?? item.user_name_jpn),
  jerseyNumber: toNumberText(item.jerseyNumber ?? item.jersey_number),
  imageUrl: toText(item.imageUrl ?? item.image_url),
});

const extractPlayerItems = (
  response: PlayerApiItem[] | ApiResponse<PlayerApiItem[]> | null | undefined
): PlayerItem[] => {
  const items = Array.isArray(response) ? response : response?.data;
  return (items ?? []).map(toPlayerItem);
};

const PlayerListPage: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<PlayerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPlayers = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await apiClient.get<PlayerApiItem[] | ApiResponse<PlayerApiItem[]>>(
          PLAYER_LIST_ENDPOINT
        );
        if (!isMounted) {
          return;
        }
        setItems(extractPlayerItems(response.data));
      } catch (error) {
        console.error("Failed to fetch player list:", error);
        if (isMounted) {
          setErrorMessage("選手一覧の取得に失敗しました。");
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchPlayers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlayerClick = (item: PlayerItem) => {
    void router.push({
      pathname: "/player/player-detail",
      query: toPlayerDetailQuery(item),
    });
  };

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            color: colors.grayDark,
          }}
        >
          読み込み中...
        </Box>
      );
    }

    if (errorMessage) {
      return (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${colors.commonBorderGray}`,
            backgroundColor: colors.commonFontColorWhite,
            color: colors.Red,
          }}
        >
          {errorMessage}
        </Box>
      );
    }

    if (items.length === 0) {
      return (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            color: colors.grayDark,
            border: `1px dashed ${colors.commonBorderGray}`,
            borderRadius: 2,
            backgroundColor: colors.commonFontColorWhite,
          }}
        >
          表示できる選手がありません。
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {items.map((item) => {
          const hasImage = item.imageUrl.trim().length > 0;

          return (
            <Box
              key={item.userId}
              sx={{
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr)",
                gap: 2,
                padding: 2.5,
                borderRadius: 4,
                border: `1px solid ${colors.commonBorderGray}`,
                backgroundColor: colors.commonFontColorWhite,
                boxShadow: "0 10px 24px rgba(0, 0, 0, 0.06)",
                alignItems: "stretch",
                minHeight: 220,
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 14px 30px rgba(0, 0, 0, 0.10)",
                },
              }}
              onClick={() => handlePlayerClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handlePlayerClick(item);
                }
              }}
            >
              {hasImage ? (
                <img
                  src={toLinkHref(item.imageUrl.trim())}
                  alt={item.userNameJpn || item.userName || "player"}
                  style={{
                    width: "100%",
                    height: 176,
                    borderRadius: 12,
                    objectFit: "cover",
                    border: `1px solid ${colors.commonBorderGray}`,
                    backgroundColor: colors.commonFontColorWhite,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: 176,
                    borderRadius: 3,
                    border: `1px solid ${colors.commonBorderGray}`,
                    backgroundColor: colors.grayLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.grayDark,
                    fontSize: 12,
                  }}
                >
                  画像なし
                </Box>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, minWidth: 0, py: 0.25 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "flex-start",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 999,
                    backgroundColor: colors.Black,
                    color: colors.commonFontColorWhite,
                    fontSize: 12,
                    letterSpacing: 1,
                  }}
                >
                  選手番号
                </Box>
                <Font20 sx={{ fontWeight: 800, fontSize: 40, lineHeight: 1, letterSpacing: -1 }}>
                  {item.jerseyNumber}
                </Font20>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, minWidth: 0 }}>
                  <Font14 sx={{ color: colors.grayDark }}>選手名（かな）</Font14>
                  <Font20 sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>{item.userNameJpn || "-"}</Font20>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, minWidth: 0 }}>
                  <Font14 sx={{ color: colors.grayDark }}>選手名</Font14>
                  <Font14 sx={{ fontSize: 16, overflowWrap: "anywhere" }}>{item.userName || "-"}</Font14>
                </Box>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignSelf: "flex-start",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 999,
                    backgroundColor: colors.LightBlue,
                    color: colors.Black,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    mt: "auto",
                  }}
                >
                  選手詳細を見る
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }, [errorMessage, items, isLoading]);

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 32px, 1280px)", mx: "auto", py: 2, gap: 2 }}>
        <Box sx={{ gap: 0.5 }}>
          <Font20>選手一覧</Font20>
          <Font14 sx={{ color: colors.grayDark }}>
            選手テーブルの画像、選手番号、選手名（かな）、選手名 を 2 枚ずつ並べて表示します。
          </Font14>
        </Box>

        {content}
      </Box>
    </PageContainer>
  );
};

export default PlayerListPage;
