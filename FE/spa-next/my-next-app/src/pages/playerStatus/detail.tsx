import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import PageContainer from "@base/Layout/PageContainer";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonBack from "@/components/base/Button/ButtonBack";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { apiService } from "@/api/apiService";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useAuth } from "@/hooks/useAuth";
import { getMessage, MessageCodes } from "@/message";
import colors from "@/styles/colors";

type StatusField = {
  label: string;
  key: string;
  value: string;
};

const STATUS_OPTIONS = Array.from({ length: 10 }, (_, index) => String(index + 1));

const getQueryText = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

const PlayerStatusDetailPage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { userId: currentUserId } = useAuth();
  const playerId = getQueryText(router.query.memberId);
  const playerName = getQueryText(router.query.name) || "太一";

  const [statusMap, setStatusMap] = useState<Record<string, string>>({
    shoot: "6",
    dribble: "7",
    pass: "8",
    defense: "5",
    stamina: "9",
  });

  const fields: StatusField[] = useMemo(
    () => [
      { label: "シュート", key: "shoot", value: statusMap.shoot },
      { label: "ドリブル", key: "dribble", value: statusMap.dribble },
      { label: "パス", key: "pass", value: statusMap.pass },
      { label: "ディフェンス", key: "defense", value: statusMap.defense },
      { label: "スタミナ", key: "stamina", value: statusMap.stamina },
    ],
    [statusMap]
  );

  const handleChange = (key: string) => (event: SelectChangeEvent<string>) => {
    setStatusMap((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const handleSave = async () => {
    if (!playerId) {
      showSnackbar(getMessage(MessageCodes.DATA_NOT_FOUND), "ERROR");
      return;
    }
    const reviewUserId = currentUserId ? Number(currentUserId) : NaN;
    if (!Number.isInteger(reviewUserId) || reviewUserId <= 0) {
      showSnackbar(getMessage(MessageCodes.DATA_NOT_FOUND), "ERROR");
      return;
    }

    try {
      await apiService.put(`/api/player-status/${playerId}`, {
        userId: Number(playerId),
        reviewUserId,
        shooting: Number(statusMap.shoot),
        dribbling: Number(statusMap.dribble),
        passing: Number(statusMap.pass),
        defense: Number(statusMap.defense),
        stamina: Number(statusMap.stamina),
        remarks: null,
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "個人ステータスを保存"), "SUCCESS");
    } catch (error) {
      console.error("Failed to save player status:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "個人ステータスの保存"), "ERROR");
    }
  };

  return (
    <PageContainer>
      <Box sx={{ width: "100%", maxWidth: "none", mx: "auto", py: 2, px: { xs: 2, md: 4 }, gap: 2 }}>
        <Box sx={{ gap: 0.5 }}>
          <Font20>個人ステータス詳細</Font20>
          <Font14 sx={{ color: colors.grayDark }}>選手ごとの能力値を 1 から 10 で設定する画面です。</Font14>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 1 }}>
          <ButtonBack onClick={() => void router.push("/playerStatus/list")} />
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            borderRadius: 3,
            border: `1px solid ${colors.commonBorderGray}`,
            backgroundColor: colors.commonFontColorWhite,
            p: { xs: 1.5, md: 3 },
          }}
        >
          <Box sx={{ display: "grid", gap: 0.5 }}>
            <Font14 sx={{ color: colors.grayDark, fontWeight: 700 }}>選手名</Font14>
            <Box
              sx={{
                display: "inline-flex",
                alignSelf: "flex-start",
                px: 1.5,
                py: 1,
                borderRadius: 2,
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                border: `1px solid ${colors.commonBorderGray}`,
                fontWeight: 700,
              }}
            >
              {playerName}
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "180px 1fr" },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "grid", gap: 0.5 }}>
              <Font14 sx={{ color: colors.grayDark, fontWeight: 700 }}>項目名</Font14>
              <Font14 sx={{ color: colors.grayDark }}>ステータス</Font14>
            </Box>

            <Box sx={{ display: "grid", gap: 1.25 }}>
              {fields.map((field) => (
                <Box
                  key={field.key}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "160px 1fr" },
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Font14 sx={{ fontWeight: 700 }}>{field.label}</Font14>
                  <Select
                    size="small"
                    value={field.value}
                    onChange={handleChange(field.key)}
                    sx={{
                      backgroundColor: colors.commonFontColorWhite,
                      "& .MuiSelect-select": {
                        py: 1,
                      },
                    }}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <ButtonAction label="保存" onClick={() => void handleSave()} />
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default PlayerStatusDetailPage;
