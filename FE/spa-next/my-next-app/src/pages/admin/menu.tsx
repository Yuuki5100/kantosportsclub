import React from "react";
import { useRouter } from "next/router";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { Button, Paper } from "@mui/material";
import { Box, Font14, Font20 } from "@/components/base";
import PageContainer from "@base/Layout/PageContainer";
import colors from "@/styles/colors";

type AdminAction = {
  label: string;
  description: string;
  icon: React.ReactNode;
};

const adminActions: AdminAction[] = [
  {
    label: "写真追加",
    description: "写真データを追加するための入口です。",
    icon: <AddPhotoAlternateIcon />,
  },
  {
    label: "動画追加",
    description: "動画データを追加するための入口です。",
    icon: <VideoCallIcon />,
  },
  {
    label: "設定追加",
    description: "システム設定を追加するための入口です。",
    icon: <SettingsSuggestIcon />,
  },
];

const AdminMenuPage: React.FC = () => {
  const router = useRouter();

  return (
    <PageContainer>
      <Box sx={{ width: "100%", gap: 2 }}>
        <Box sx={{ width: "100%", gap: 0.5 }}>
          <Font20>管理者ページ</Font20>
          <Font14 sx={{ color: colors.grayDark }}>管理者向けの追加操作を選択できます。</Font14>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
            width: "100%",
          }}
        >
          {adminActions.map((action) => (
            <Paper
              key={action.label}
              variant="outlined"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 1.5,
                width: "100%",
                minWidth: 0,
                p: 2,
                borderColor: colors.commonBorderGray,
              }}
            >
              <Box sx={{ width: "100%", gap: 0.5 }}>
                <Font14 sx={{ color: colors.commonFontColorBlack }}>{action.label}</Font14>
                <Font14 bold={false} sx={{ color: colors.grayDark }}>
                  {action.description}
                </Font14>
              </Box>

              <Button
                type="button"
                variant="contained"
                startIcon={action.icon}
                onClick={() => {
                  if (action.label === "動画追加") {
                    router.push("/movies/create");
                  }
                }}
                sx={{
                  alignSelf: "flex-start",
                  minWidth: 132,
                  whiteSpace: "nowrap",
                }}
              >
                {action.label}
              </Button>
            </Paper>
          ))}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default AdminMenuPage;
