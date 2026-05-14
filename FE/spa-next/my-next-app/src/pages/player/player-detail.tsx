import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PageContainer from "@base/Layout/PageContainer";
import apiClient from "@/api/apiClient";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonBack from "@/components/base/Button/ButtonBack";
import colors from "@/styles/colors";

type PlayerDetailApiResponse = {
  userName: string | null;
  userNameJpn: string | null;
  jerseyNumber: number | null;
  imageUrl: string | null;
  enthusiasm: string | null;
  hopeStyle: string | null;
  remarks: string | null;
};

const toText = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

const toLinkHref = (url: string): string => {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url) || url.startsWith("/")) {
    return url;
  }
  return `https://${url}`;
};

const PlayerDetailPage: React.FC = () => {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerDetailApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const userId = toText(router.query.userId);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    let isMounted = true;

    const fetchPlayer = async () => {
      if (!userId) {
        setErrorMessage("選手IDが指定されていません。");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await apiClient.get<PlayerDetailApiResponse>(`/api/mypage/${userId}`);
        if (!isMounted) {
          return;
        }
        setPlayer(response.data);
      } catch (error) {
        console.error("Failed to fetch player detail:", error);
        if (isMounted) {
          setErrorMessage("選手詳細の取得に失敗しました。");
          setPlayer(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchPlayer();

    return () => {
      isMounted = false;
    };
  }, [router.isReady, userId]);

  const hasImage = (player?.imageUrl ?? "").trim().length > 0;

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 64px, 1280px)", mx: "auto", py: 2, gap: 2 }}>
        <Box sx={{ gap: 0.5 }}>
          <Font20>選手詳細</Font20>
          <Font14 sx={{ color: colors.grayDark }}>一覧から選択した選手の詳細を表示します。</Font14>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <ButtonBack onClick={() => void router.push("/player")} />
        </Box>

        {isLoading ? (
          <Font14 sx={{ color: colors.grayDark, py: 4, textAlign: "center" }}>読み込み中...</Font14>
        ) : errorMessage ? (
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
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "420px minmax(0, 1fr)",
              },
              gap: 2,
              padding: 2.5,
              borderRadius: 4,
              border: `1px solid ${colors.commonBorderGray}`,
              backgroundColor: colors.commonFontColorWhite,
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.06)",
            }}
          >
            {hasImage ? (
              <img
                src={toLinkHref(player?.imageUrl?.trim() ?? "")}
                alt={player?.userNameJpn || player?.userName || "player"}
                style={{
                  width: "100%",
                  minHeight: 320,
                  borderRadius: 16,
                  objectFit: "cover",
                  border: `1px solid ${colors.commonBorderGray}`,
                  backgroundColor: colors.commonFontColorWhite,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  minHeight: 320,
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

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
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
              <Font20 sx={{ fontWeight: 800, fontSize: 48, lineHeight: 1, letterSpacing: -1 }}>
                {player?.jerseyNumber ?? "-"}
              </Font20>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                <Font14 sx={{ color: colors.grayDark }}>選手名（かな）</Font14>
                <Font20 sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                  {player?.userNameJpn || "-"}
                </Font20>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                <Font14 sx={{ color: colors.grayDark }}>選手名</Font14>
                <Font14 sx={{ fontSize: 16, overflowWrap: "anywhere" }}>
                  {player?.userName || "-"}
                </Font14>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                <Font14 sx={{ color: colors.grayDark }}>意気込み</Font14>
                <Font14>{player?.enthusiasm || "-"}</Font14>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                <Font14 sx={{ color: colors.grayDark }}>目指すスタイル</Font14>
                <Font14>{player?.hopeStyle || "-"}</Font14>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                <Font14 sx={{ color: colors.grayDark }}>備考</Font14>
                <Font14>{player?.remarks || "-"}</Font14>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default PlayerDetailPage;
