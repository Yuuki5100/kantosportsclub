import React, { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { TextField } from "@mui/material";
import { Box, Font14, Font20 } from "@/components/base";
import { apiService } from "@/api/apiService";
import ButtonAction from "@/components/base/Button/ButtonAction";
import PageContainer from "@base/Layout/PageContainer";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";
import colors from "@/styles/colors";

const BOARDGAME_CREATE_ENDPOINT = "/api/boardgames";

type BoardgameCreateRequest = {
  boardgameName: string | null;
  ownerName: string | null;
  peopleMin: number | null;
  peopleMax: number | null;
  needTime: number | null;
  urlStr: string | null;
  howToPlay: string | null;
  remarks: string | null;
};

type BoardgameCreateState = {
  boardgameName: string;
  ownerName: string;
  peopleMin: string;
  peopleMax: string;
  needTime: string;
  urlStr: string;
  howToPlay: string;
  remarks: string;
};

const INITIAL_STATE: BoardgameCreateState = {
  boardgameName: "",
  ownerName: "",
  peopleMin: "",
  peopleMax: "",
  needTime: "",
  urlStr: "",
  howToPlay: "",
  remarks: "",
};

const toNullableNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const isInvalidPositiveIntegerInput = (value: string): boolean => {
  const trimmed = value.trim();
  const parsed = Number(trimmed);
  return trimmed !== "" && (!Number.isInteger(parsed) || parsed <= 0);
};

const BoardgameCreatePage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState<BoardgameCreateState>(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = useCallback(
    (field: keyof BoardgameCreateState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const handleBack = useCallback(() => {
    router.push("/admin/menu");
  }, [router]);

  const handleSave = useCallback(async () => {
    if (
      isInvalidPositiveIntegerInput(form.peopleMin) ||
      isInvalidPositiveIntegerInput(form.peopleMax) ||
      isInvalidPositiveIntegerInput(form.needTime)
    ) {
      showSnackbar("人数と目安時間は正の整数で入力してください。", "ERROR");
      return;
    }

    const payload: BoardgameCreateRequest = {
      boardgameName: form.boardgameName.trim() || null,
      ownerName: form.ownerName.trim() || null,
      peopleMin: toNullableNumber(form.peopleMin),
      peopleMax: toNullableNumber(form.peopleMax),
      needTime: toNullableNumber(form.needTime),
      urlStr: form.urlStr.trim() || null,
      howToPlay: form.howToPlay.trim() || null,
      remarks: form.remarks.trim() || null,
    };

    setIsSaving(true);
    try {
      await apiService.post(BOARDGAME_CREATE_ENDPOINT, payload);
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "ボードゲームを追加"), "SUCCESS");
      router.push("/boardgames");
    } catch (error) {
      console.error("Create boardgame failed:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ボードゲームの追加"), "ERROR");
    } finally {
      setIsSaving(false);
    }
  }, [form, router, showSnackbar]);

  return (
    <PageContainer>
      <Box sx={{ width: "100%", gap: 2 }}>
        <Box sx={{ width: "100%", gap: 0.5 }}>
          <Font20>ボードゲーム追加</Font20>
          <Font14 sx={{ color: colors.grayDark }}>
            ボードゲームの基本情報を入力して登録します。
          </Font14>
        </Box>

        <Box
          sx={{
            width: "100%",
            border: `1.5px solid ${colors.commonBorderGray}`,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
              width: "100%",
              borderBottom: `1.5px solid ${colors.commonBorderGray}`,
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 1.5,
                bgcolor: colors.commonTableHeader,
                color: colors.commonFontColorBlack,
                fontWeight: 600,
              }}
            >
              ゲーム名
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="boardgameCreateName"
                value={form.boardgameName}
                size="small"
                fullWidth
                onChange={handleChange("boardgameName")}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
              width: "100%",
              borderBottom: `1.5px solid ${colors.commonBorderGray}`,
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 1.5,
                bgcolor: colors.commonTableHeader,
                color: colors.commonFontColorBlack,
                fontWeight: 600,
              }}
            >
              所有者
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="boardgameCreateOwner"
                value={form.ownerName}
                size="small"
                fullWidth
                onChange={handleChange("ownerName")}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
              width: "100%",
              borderBottom: `1.5px solid ${colors.commonBorderGray}`,
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 1.5,
                bgcolor: colors.commonTableHeader,
                color: colors.commonFontColorBlack,
                fontWeight: 600,
              }}
            >
              人数最小
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="boardgameCreatePeopleMin"
                value={form.peopleMin}
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
                onChange={handleChange("peopleMin")}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
              width: "100%",
              borderBottom: `1.5px solid ${colors.commonBorderGray}`,
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 1.5,
                bgcolor: colors.commonTableHeader,
                color: colors.commonFontColorBlack,
                fontWeight: 600,
              }}
            >
              人数最大
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="boardgameCreatePeopleMax"
                value={form.peopleMax}
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
                onChange={handleChange("peopleMax")}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
              width: "100%",
              borderBottom: `1.5px solid ${colors.commonBorderGray}`,
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 1.5,
                bgcolor: colors.commonTableHeader,
                color: colors.commonFontColorBlack,
                fontWeight: 600,
              }}
            >
              目安時間
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="boardgameCreateNeedTime"
                value={form.needTime}
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
                onChange={handleChange("needTime")}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
              width: "100%",
              borderBottom: `1.5px solid ${colors.commonBorderGray}`,
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 1.5,
                bgcolor: colors.commonTableHeader,
                color: colors.commonFontColorBlack,
                fontWeight: 600,
              }}
            >
              URL
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="boardgameCreateUrl"
                value={form.urlStr}
                size="small"
                fullWidth
                onChange={handleChange("urlStr")}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
              width: "100%",
              borderBottom: `1.5px solid ${colors.commonBorderGray}`,
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 1.5,
                bgcolor: colors.commonTableHeader,
                color: colors.commonFontColorBlack,
                fontWeight: 600,
              }}
            >
              遊び方
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="boardgameCreateHowToPlay"
                value={form.howToPlay}
                size="small"
                fullWidth
                multiline
                minRows={3}
                onChange={handleChange("howToPlay")}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: "100%",
                p: 1.5,
                bgcolor: colors.commonTableHeader,
                color: colors.commonFontColorBlack,
                fontWeight: 600,
              }}
            >
              備考
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="boardgameCreateRemarks"
                value={form.remarks}
                size="small"
                fullWidth
                multiline
                minRows={3}
                onChange={handleChange("remarks")}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ width: "100%", flexDirection: "row", gap: 1.5, alignItems: "center" }}>
          <ButtonAction label="戻る" color="secondary" onClick={handleBack} />
          <ButtonAction label="登録" onClick={handleSave} disabled={isSaving} />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default BoardgameCreatePage;
