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
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(2, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {items.map((item) => {
          const hasImage = item.imageUrl.trim().length > 0;

          return (
            <Box
              key={item.userId}
              sx={{
                width: {
                  xs: "calc(100% + 4px)",
                  md: "100%",
                },
                maxWidth: {
                  xs: "none",
                  md: 208,
                },
                ml: {
                  xs: "-2px",
                  md: 0,
                },
                cursor: "pointer",
                justifySelf: "center",
              }}
              onClick={() => handlePlayerClick(item)}
              role="button"
              tabIndex={0}
            >
              {hasImage ? (
                <img
                  src={toLinkHref(item.imageUrl.trim())}
                  alt={item.userNameJpn || item.userName || "player"}
                  style={{
                    width: "100%",
                    maxWidth: 170,
                    height: 146,
                    objectFit: "cover",
                    border: `1px solid ${colors.Black}`,
                    display: "block",
                    margin: "0 auto",
                    backgroundColor: colors.commonFontColorWhite,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 170,
                    height: 146,
                    mx: "auto",
                    border: `1px solid ${colors.Black}`,
                    backgroundColor: colors.commonFontColorWhite,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  画像
                </Box>
              )}

              <Box
                sx={{
                  mt: 0.75,
                  width: "100%",
                  maxWidth: 170,
                  mx: "auto",
                  display: "grid",
                  gridTemplateColumns: "60px 1fr",
                  columnGap: 0.5,
                  alignItems: "start",
                  textAlign: "center",
                }}
              >
                <Box sx={{ textAlign: "left" }}>
                  <Font14 sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.1 }}>
                    選手番号
                  </Font14>
                  <Font20 sx={{ fontSize: 34, fontWeight: 800, lineHeight: 0.92 }}>
                    {item.jerseyNumber}
                  </Font20>
                </Box>

                <Box sx={{ textAlign: "left", minWidth: 0 }}>
                  <Font14 sx={{ fontSize: 19, fontWeight: 700, lineHeight: 1.1 }}>
                    {item.userNameJpn || "-"}
                  </Font14>
                  <Font14 sx={{ mt: 0.25, fontSize: 16, fontWeight: 700, lineHeight: 1.1 }}>
                    {item.userName || "-"}
                  </Font14>
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
        </Box>

        {content}
      </Box>
    </PageContainer>
  );
};

export default PlayerListPage;
