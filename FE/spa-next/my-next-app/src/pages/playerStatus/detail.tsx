import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Checkbox, FormControlLabel, FormGroup, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import PageContainer from "@base/Layout/PageContainer";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonBack from "@/components/base/Button/ButtonBack";
import ButtonAction from "@/components/base/Button/ButtonAction";
import apiClient from "@/api/apiClient";
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

type MypageApiResponse = {
  hopeStyle: string | null;
};

const HOPE_STYLE_OPTIONS = ["G", "F", "C"] as const;

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
  const [hopeStyleOptions, setHopeStyleOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!router.isReady || !playerId) {
      return;
    }

    if (!currentUserId) {
      return;
    }

    let isMounted = true;

    const fetchPlayerStatus = async () => {
      try {
        const playerStatusResponse = await apiClient.get<PlayerStatusApiResponse>(`/api/player-status/user/${playerId}`);
        if (!isMounted) {
          return;
        }

        setStatusMap({
          shoot: String(playerStatusResponse.data.shooting ?? 6),
          dribble: String(playerStatusResponse.data.dribbling ?? 7),
          pass: String(playerStatusResponse.data.passing ?? 8),
          defense: String(playerStatusResponse.data.defense ?? 5),
          stamina: String(playerStatusResponse.data.stamina ?? 9),
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to fetch player status:", error);
      }
    };

    const fetchMypage = async () => {
      try {
        const mypageResponse = await apiClient.get<MypageApiResponse>(`/api/mypage/${playerId}`);
        if (!isMounted) {
          return;
        }

        setHopeStyleOptions(
          (mypageResponse.data.hopeStyle ?? "")
            .split(" / ")
            .map((value) => value.trim())
            .filter((value): value is string => HOPE_STYLE_OPTIONS.includes(value as (typeof HOPE_STYLE_OPTIONS)[number]))
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to fetch mypage:", error);
      }
    };

    void fetchPlayerStatus();
    void fetchMypage();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, playerId, router.isReady]);

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

  const handleHopeStyleToggle = (option: string) => (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setHopeStyleOptions((current) => {
      if (checked) {
        return current.includes(option) ? current : [...current, option];
      }
      return current.filter((item) => item !== option);
    });
  };

  const hopeStyleValue = useMemo(() => hopeStyleOptions.join(" / "), [hopeStyleOptions]);

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
      await apiService.put(`/api/player-status/user/${playerId}`, {
        userId: Number(playerId),
        reviewUserId,
        shooting: Number(statusMap.shoot),
        dribbling: Number(statusMap.dribble),
        passing: Number(statusMap.pass),
        defense: Number(statusMap.defense),
        stamina: Number(statusMap.stamina),
        remarks: null,
      });

      await apiService.put(`/api/mypage/${playerId}/hope-style`, {
        hopeStyle: hopeStyleValue,
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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "180px 1fr" },
              gap: 1.5,
              alignItems: "start",
            }}
          >
            <Box sx={{ display: "grid", gap: 0.5 }}>
              <Font14 sx={{ color: colors.grayDark, fontWeight: 700 }}>ポジション</Font14>
              <Font14 sx={{ color: colors.grayDark }}>G / F / C を複数選択できます</Font14>
            </Box>

            <FormGroup row>
              {HOPE_STYLE_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={hopeStyleOptions.includes(option)}
                      onChange={handleHopeStyleToggle(option)}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
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
