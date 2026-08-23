import React, { useMemo } from "react";
import { useRouter } from "next/router";
import PageContainer from "@base/Layout/PageContainer";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonBack from "@/components/base/Button/ButtonBack";
import colors from "@/styles/colors";

type PlayerStatusSummary = {
  name: string;
  memberId: string;
};

const PLAYER_STATUS_LIST: PlayerStatusSummary[] = [
  { name: "gotou", memberId: "4" },
  { name: "taichi", memberId: "5" },
  { name: "wada", memberId: "6" },
  { name: "takamura", memberId: "7" },
  { name: "abe", memberId: "8" },
  { name: "koizumi", memberId: "9" },
  { name: "kawahara", memberId: "10" },
  { name: "takafumi", memberId: "11" },
  { name: "keita", memberId: "12" },
  { name: "narita", memberId: "13" },
  { name: "oosawa", memberId: "14" },
  { name: "araki", memberId: "15" },
  { name: "orita", memberId: "16" },
  { name: "hyuya", memberId: "17" },
];

const PlayerStatusListPage: React.FC = () => {
  const router = useRouter();

  const rows = useMemo(() => PLAYER_STATUS_LIST, []);

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 64px, 1280px)", mx: "auto", py: 2, gap: 2 }}>
        <Box sx={{ gap: 0.5 }}>
          <Font20>個人ステータス設定</Font20>
          <Font14 sx={{ color: colors.grayDark }}>選手を選択して、個人ステータスを確認・編集します。</Font14>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <ButtonBack onClick={() => void router.push("/")} />
        </Box>

        <Box
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.commonBorderGray}`,
            backgroundColor: colors.commonFontColorWhite,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(120px, 1fr) minmax(120px, 2fr) minmax(96px, 120px)",
              gap: 0,
              px: 2,
              py: 1.5,
              backgroundColor: "rgba(0, 0, 0, 0.03)",
              borderBottom: `1px solid ${colors.commonBorderGray}`,
              fontWeight: 700,
            }}
          >
            <Font14>選手名</Font14>
            <Font14 sx={{ textAlign: "right" }}>操作</Font14>
          </Box>

          {rows.map((row, index) => (
            <Box
              key={row.memberId}
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(120px, 1fr) minmax(96px, 120px)",
                alignItems: "center",
                px: 2,
                py: 1.5,
                borderBottom: index === rows.length - 1 ? "none" : `1px solid ${colors.commonBorderGray}`,
                gap: 1,
              }}
            >
              <Font14 sx={{ fontWeight: 700 }}>{row.name}</Font14>
              <Font14
                sx={{
                  justifySelf: "end",
                  cursor: "pointer",
                  color: colors.Black,
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
                onClick={() =>
                  void router.push({
                    pathname: "/playerStatus/detail",
                    query: { name: row.name, memberId: row.memberId },
                  })
                }
              >
                開く
              </Font14>
            </Box>
          ))}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default PlayerStatusListPage;
