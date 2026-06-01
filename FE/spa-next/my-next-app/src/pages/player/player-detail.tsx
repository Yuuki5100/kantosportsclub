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

type PlayerStatusApiResponse = {
  id: number;
  userId: number;
  reviewUserId: number;
  shooting: number | null;
  dribbling: number | null;
  passing: number | null;
  defense: number | null;
  stamina: number | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

type PlayerStatusRecordApiResponse = PlayerStatusApiResponse;

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

type RadarMetric = {
  label: string;
  value: number;
};

const clampRadarValue = (value: number): number => Math.max(0, Math.min(10, value));

const toRadarValue = (value: number | null | undefined): number => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0;
  }
  return clampRadarValue(Math.round(value));
};

const averageNullableNumbers = (values: Array<number | null | undefined>): number | null => {
  const validValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (validValues.length === 0) {
    return null;
  }
  return Math.floor(validValues.reduce((sum, value) => sum + value, 0) / validValues.length);
};

const PlayerRadarChart: React.FC<{ metrics: RadarMetric[] }> = ({ metrics }) => {
  const size = 188;
  const center = size / 2;
  const radius = 62;
  const ringLevels = [0.25, 0.5, 0.75, 1];
  const points = metrics.map((metric, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / metrics.length;
    const distance = radius * (clampRadarValue(metric.value) / 10);
    return {
      ...metric,
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      axisX: center + Math.cos(angle) * radius,
      axisY: center + Math.sin(angle) * radius,
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");
  const outerPolygon = points.map((point) => `${point.axisX},${point.axisY}`).join(" ");

  return (
    <Box
      sx={{
        maxWidth: "100%",
        height: 190,
        borderRadius: 3,
        border: `1px solid ${colors.commonBorderGray}`,
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.10)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", width: "100%", height: "100%", px: 1.25, pt: 1.25, pb: 0.75 }}>
        {/* <Font14 sx={{ fontSize: 11, fontWeight: 700, color: colors.grayDark, mb: 0.25 }}>
          ステータス
        </Font14> */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{
            display: "block",
            transform: "translate(-10px, -6px)",
          }}
        >
          {ringLevels.map((level) => (
            <polygon
              key={level}
              points={points
                .map((point) => {
                  const distance = radius * level;
                  const angle = Math.atan2(point.axisY - center, point.axisX - center);
                  return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
                })
                .join(" ")}
              fill="none"
              stroke="rgba(0, 0, 0, 0.08)"
              strokeWidth={1}
            />
          ))}
          {points.map((point) => (
            <line
              key={`${point.label}-axis`}
              x1={center}
              y1={center}
              x2={point.axisX}
              y2={point.axisY}
              stroke="rgba(0, 0, 0, 0.08)"
              strokeWidth={1}
            />
          ))}
          <polygon
            points={outerPolygon}
            fill="rgba(0, 0, 0, 0.03)"
            stroke="rgba(0, 0, 0, 0.16)"
            strokeWidth={1}
          />
          <polygon points={polygon} fill="rgba(0, 0, 0, 0.22)" stroke={colors.Black} strokeWidth={2} />
          {points.map((point) => (
            <circle key={`${point.label}-dot`} cx={point.x} cy={point.y} r={3} fill={colors.Black} />
          ))}
          {points.map((point, index) => {
            const labelAngle = -Math.PI / 2 + (Math.PI * 2 * index) / metrics.length;
            const labelRadius = radius + 18;
            const labelX = center + Math.cos(labelAngle) * labelRadius;
            const labelY = center + Math.sin(labelAngle) * labelRadius;
            const textAnchor = Math.abs(Math.cos(labelAngle)) < 0.15 ? "middle" : Math.cos(labelAngle) > 0 ? "start" : "end";
            const dominantBaseline =
              Math.abs(Math.sin(labelAngle)) < 0.15 ? "middle" : Math.sin(labelAngle) > 0 ? "hanging" : "auto";

            return (
              <text
                key={`${point.label}-label`}
                x={labelX}
                y={labelY}
                textAnchor={textAnchor}
                dominantBaseline={dominantBaseline}
                fill={colors.grayDark}
                fontSize="10"
                fontWeight="600"
              >
                {point.label}
              </text>
            );
          })}
          {points.map((point) => (
            <text
              key={`${point.label}-value`}
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              fill={colors.Black}
              fontSize="9"
              fontWeight="700"
            >
              {point.value}
            </text>
          ))}
        </svg>
      </Box>
    </Box>
  );
};

const DetailBlock: React.FC<{ label: string; value: string | number | null | undefined; strong?: boolean }> = ({
  label,
  value,
  strong = false,
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, minWidth: 0 }}>
    <Font14 sx={{ color: colors.grayDark, fontWeight: 700 }}>{label}</Font14>
    <Font14
      sx={{
        fontSize: strong ? 18 : 16,
        fontWeight: strong ? 800 : 600,
        lineHeight: 1.35,
        overflowWrap: "anywhere",
      }}
    >
      {value || "-"}
    </Font14>
  </Box>
);

const PlayerDetailPage: React.FC = () => {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerDetailApiResponse | null>(null);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatusApiResponse | null>(null);
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
        const [playerResponse, statusResponse] = await Promise.all([
          apiClient.get<PlayerDetailApiResponse>(`/api/mypage/${userId}`),
          apiClient.get<PlayerStatusRecordApiResponse[]>(`/api/player-status/user/${userId}/records`),
        ]);
        if (!isMounted) {
          return;
        }
        setPlayer(playerResponse.data);
        const statusRecords = statusResponse.data;
        if (statusRecords.length === 0) {
          setPlayerStatus(null);
          return;
        }

        setPlayerStatus({
          id: statusRecords[0].id,
          userId: statusRecords[0].userId,
          reviewUserId: statusRecords[0].reviewUserId,
          shooting: averageNullableNumbers(statusRecords.map((item) => item.shooting)),
          dribbling: averageNullableNumbers(statusRecords.map((item) => item.dribbling)),
          passing: averageNullableNumbers(statusRecords.map((item) => item.passing)),
          defense: averageNullableNumbers(statusRecords.map((item) => item.defense)),
          stamina: averageNullableNumbers(statusRecords.map((item) => item.stamina)),
          remarks: statusRecords[0].remarks,
          created_at: statusRecords[0].created_at,
          updated_at: statusRecords[0].updated_at,
        });
      } catch (error) {
        console.error("Failed to fetch player detail:", error);
        if (isMounted) {
          setErrorMessage("選手詳細の取得に失敗しました。");
          setPlayer(null);
          setPlayerStatus(null);
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
  const radarMetrics: RadarMetric[] = [
    { label: "シュート", value: toRadarValue(playerStatus?.shooting) },
    { label: "ドリブル", value: toRadarValue(playerStatus?.dribbling) },
    { label: "パス", value: toRadarValue(playerStatus?.passing) },
    { label: "ディフェンス", value: toRadarValue(playerStatus?.defense) },
    { label: "スタミナ", value: toRadarValue(playerStatus?.stamina) },
  ];

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 24px, 1280px)", mx: "auto", py: 2, gap: 2 }}>
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
              padding: { xs: 1.5, md: 3 },
              borderRadius: 4,
              border: `1px solid ${colors.commonBorderGray}`,
              backgroundColor: colors.commonFontColorWhite,
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.06)",
              overflowX: "auto",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "150px minmax(180px, 1fr)",
                  sm: "190px minmax(240px, 1fr)",
                  md: "260px minmax(0, 1fr)",
                },
                gap: { xs: 1.5, sm: 2, md: 3 },
                alignItems: "start",
                minWidth: { xs: 360, sm: 0 },
              }}
            >
              <Box sx={{ width: "100%" }}>
                {hasImage ? (
                  <img
                    src={toLinkHref(player?.imageUrl?.trim() ?? "")}
                    alt={player?.userNameJpn || player?.userName || "player"}
                    style={{
                      width: "100%",
                      height: 390,
                      borderRadius: 16,
                      objectFit: "cover",
                      objectPosition: "center top",
                      border: `1px solid ${colors.commonBorderGray}`,
                      backgroundColor: colors.commonFontColorWhite,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: 390,
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
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 1.4, md: 2 },
                  minWidth: 0,
                  pt: { xs: 0.5, md: 1 },
                }}
              >
                <Font20
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: 50, md: 64 },
                    lineHeight: 1,
                    letterSpacing: -1,
                  }}
                >
                  #{player?.jerseyNumber ?? "-"}
                </Font20>

                <DetailBlock label="選手名（かな）" value={player?.userNameJpn} strong />
                <DetailBlock label="選手名" value={player?.userName} strong />
                <DetailBlock label="目指すスタイル" value={player?.hopeStyle} strong />
                <PlayerRadarChart metrics={radarMetrics} />
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
              <DetailBlock label="意気込み" value={player?.enthusiasm} />
              <DetailBlock label="目指すスタイル" value={player?.hopeStyle} />
              <DetailBlock label="備考" value={player?.remarks} />
            </Box>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default PlayerDetailPage;
