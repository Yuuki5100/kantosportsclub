import React from "react";
import { useRouter } from "next/router";
import { Button } from "@mui/material";
import { Box, Font20 } from "@/components/base";
import PageContainer from "@base/Layout/PageContainer";
import colors from "@/styles/colors";

const ACTIONS = [
  { label: "コミュニティ作成", path: "/communities/create", backgroundColor: "#dbe7f8", hoverColor: "#c8d9f2" },
  { label: "ボドゲ追加", path: "/boardgames/create", backgroundColor: "#e7f2b8", hoverColor: "#d9e99a" },
  { label: "参加ルール", path: "/admin/basketball-overview", backgroundColor: "#fbe4ec", hoverColor: "#f6cedc" },
  { label: "試合ルール", path: "/admin/game-rules", backgroundColor: colors.commonFontColorWhite, hoverColor: colors.grayLight },
] as const;

const TopPageActionSections: React.FC = () => {
  const router = useRouter();

  return (
    <PageContainer>
      <Box
        sx={{
          width: "min(100vw - 32px, 1152px)",
          maxWidth: "95%",
          py: 0.75,
          mx: "auto",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
            width: "100%",
            maxWidth: 640,
            mx: "auto",
          }}
        >
          {ACTIONS.map((action) => (
            <Button
              key={action.path}
              type="button"
              onClick={() => void router.push(action.path)}
              sx={{
                minHeight: 88,
                px: 1,
                border: `1px solid ${colors.commonBorderGray}`,
                borderRadius: 2,
                backgroundColor: action.backgroundColor,
                color: colors.commonFontColorBlack,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                transition: "background-color 0.15s ease, transform 0.15s ease",
                "&:hover": {
                  backgroundColor: action.hoverColor,
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              <Font20>{action.label}</Font20>
            </Button>
          ))}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default TopPageActionSections;
