import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PageContainer from "@base/Layout/PageContainer";
import apiClient from "@/api/apiClient";
import { Box, Font14 } from "@/components/base";
import ButtonBack from "@/components/base/Button/ButtonBack";
import colors from "@/styles/colors";

type PlayerDetailApiResponse = {
  userName: string | null;
  userNameJpn: string | null;
  jerseyNumber: number | null;
  imageUrl: string | null;
  enthusiasm: string | null;
  hopeStyle: string | null;
  strengths: string | null;
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

type RadarMetric = {
  label: string;
  value: number;
};

const CARD_WIDTH = 360;
const LEFT_IMAGE_WIDTH = 175;
const GAP = 8;

const toText = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

const toLinkHref = (url: string): string => {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url) || url.startsWith("/")) return url;
  return `https://${url}`;
};

const clampRadarValue = (value: number): number => Math.max(0, Math.min(10, value));

const toRadarValue = (value: number | null | undefined): number => {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return clampRadarValue(Math.round(value));
};

const averageNullableNumbers = (values: Array<number | null | undefined>): number | null => {
  const validValues = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value)
  );

  if (validValues.length === 0) return null;

  return Math.floor(validValues.reduce((sum, value) => sum + value, 0) / validValues.length);
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Box
    sx={{
      width: "100%",
      backgroundColor: "#002b5c",
      color: "#fff",
      fontWeight: 900,
      fontSize: 10,
      lineHeight: 1,
      px: 0.4,
      py: 0.6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      boxSizing: "border-box",
    }}
  >
    <span>{title}</span>
  </Box>
);

const InfoBox: React.FC<{
  title: string;
  children: React.ReactNode;
  sx?: object;
}> = ({ title, children, sx }) => (
  <Box
    sx={{
      border: `1px solid ${colors.commonBorderGray}`,
      backgroundColor: colors.commonFontColorWhite,
      overflow: "hidden",
      boxSizing: "border-box",
      minWidth: 0,
      ...sx,
    }}
  >
    <SectionTitle title={title} />
    <Box sx={{ p: 1, boxSizing: "border-box" }}>{children}</Box>
  </Box>
);

const PlayerRadarChart: React.FC<{ metrics: RadarMetric[] }> = ({ metrics }) => {
  const size = 150;
  const center = size / 2;
  const radius = 45;
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
        height: 170,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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
            stroke="rgba(0, 0, 0, 0.12)"
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
            stroke="rgba(0, 0, 0, 0.12)"
            strokeWidth={1}
          />
        ))}

        <polygon
          points={outerPolygon}
          fill="rgba(0, 43, 92, 0.04)"
          stroke="rgba(0, 0, 0, 0.2)"
          strokeWidth={1}
        />

        <polygon points={polygon} fill="rgba(0, 43, 92, 0.25)" stroke="#002b5c" strokeWidth={2} />

        {points.map((point) => (
          <circle key={`${point.label}-dot`} cx={point.x} cy={point.y} r={3} fill="#002b5c" />
        ))}

        {points.map((point, index) => {
          const labelAngle = -Math.PI / 2 + (Math.PI * 2 * index) / metrics.length;
          const labelRadius = radius + 18;
          const labelX = center + Math.cos(labelAngle) * labelRadius;
          const labelY = center + Math.sin(labelAngle) * labelRadius;

          return (
            <text
              key={`${point.label}-label`}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fill={colors.grayDark}
              fontSize="9"
              fontWeight="700"
            >
              {point.label}
            </text>
          );
        })}

        {points.map((point) => (
          <text
            key={`${point.label}-value`}
            x={point.x}
            y={point.y - 8}
            textAnchor="middle"
            fill="#000"
            fontSize="8"
            fontWeight="800"
          >
            {point.value}
          </text>
        ))}
      </svg>
    </Box>
  );
};

const PlayerDetailPage: React.FC = () => {
  const router = useRouter();

  const [player, setPlayer] = useState<PlayerDetailApiResponse | null>(null);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatusApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const userId = toText(router.query.userId);

  useEffect(() => {
    if (!router.isReady) return;

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

        if (!isMounted) return;

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
      <Box sx={{ width: "min(100vw - 64px, 1280px)", mx: "auto", py: 0 }}>
        <Box sx={{ mb: 2 }}>
          <Font14 sx={{ color: colors.grayDark }}>一覧から選択した選手の詳細を表示します。</Font14>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
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
              width: `${CARD_WIDTH}px`,
              mx: "auto",
              backgroundColor: colors.commonFontColorWhite,
              border: `1px solid ${colors.commonBorderGray}`,
              boxShadow: "0 4px 14px rgba(0,0,0,0.16)",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <Box
              sx={{
                position: "relative",
                borderTop: "5px solid #002b5c",
                borderBottom: "2px solid #0070c0",
                px: 0.8,
                py: 0.8,
                minHeight: 58,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: 8,
                  top: 10,
                  fontSize: 30,
                  fontWeight: 900,
                  color: "#002b5c",
                }}
              >
                {player?.jerseyNumber ?? "-"}
              </Box>

              <Box sx={{ pl: "58px", pr: "120px", minWidth: 0 }}>
                <Box
                  sx={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#002b5c",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {player?.userNameJpn ?? "-"}
                </Box>

                <Box sx={{ mt: 0.4, fontSize: 14, fontWeight: 800 }}>
                  {player?.userName ?? "-"}
                </Box>
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 10,
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#002b5c",
                  lineHeight: 1.2,
                  textAlign: "right",
                }}
              >
                SUPOKURA
                <br />
                BASKETBALL
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `${LEFT_IMAGE_WIDTH}px 1fr`,
                columnGap: `${GAP}px`,
                p: `${GAP}px`,
                alignItems: "start",
                boxSizing: "border-box",
              }}
            >
              <Box sx={{ display: "grid", gap: `${GAP}px`, minWidth: 0 }}>
                <Box
                  sx={{
                    height: 300,
                    border: `1px solid ${colors.commonBorderGray}`,
                    overflow: "hidden",
                    boxSizing: "border-box",
                  }}
                >
                  {hasImage ? (
                    <img
                      src={toLinkHref(player?.imageUrl?.trim() ?? "")}
                      alt={player?.userNameJpn || player?.userName || "player"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center top",
                        display: "block",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
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

                <InfoBox title="目標 / 意気込み" sx={{ minHeight: 87, width: "100%" }}>
                  <Box sx={{ fontWeight: 900, fontSize: 13, lineHeight: 1.6, wordBreak: "break-word" }}>
                    {player?.enthusiasm || "-"}
                  </Box>
                </InfoBox>
              </Box>

              <Box sx={{ display: "grid", gap: `${GAP}px`, minWidth: 0 }}>
                <InfoBox title="能力チャート" sx={{ height: 204 }}>
                  <PlayerRadarChart metrics={radarMetrics} />
                </InfoBox>

                <InfoBox title="POSITION" sx={{ minHeight: 85 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 38,
                      fontSize: 30,
                      fontWeight: 900,
                      color: "#000",
                      lineHeight: 1.2,
                      textAlign: "center",
                      wordBreak: "break-word",
                    }}
                  >
                    {player?.hopeStyle ?? "-"}
                  </Box>
                </InfoBox>

                <InfoBox title="強み / 特技" sx={{ minHeight: 90 }}>
                  <Box
                    sx={{
                      fontWeight: 900,
                      fontSize: 13,
                      lineHeight: 1.6,
                      wordBreak: "break-word",
                    }}
                  >
                    {player?.strengths || "-"}
                  </Box>
                </InfoBox>
              </Box>
            </Box>

            <Box sx={{ px: `${GAP}px`, pb: `${GAP}px`, boxSizing: "border-box", width: "100%" }}>
              <InfoBox title="一言 / COMMENT" sx={{ minHeight: 86, width: "100%" }}>
                <Box sx={{ fontSize: 18, fontWeight: 900, lineHeight: 1.6, wordBreak: "break-word" }}>
                  {player?.remarks || "-"}
                </Box>
              </InfoBox>
            </Box>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default PlayerDetailPage;