import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TextField } from "@mui/material";
import { useRouter } from "next/router";
import { Box, Font14, Font20 } from "@/components/base";
import { apiService } from "@/api/apiService";
import ButtonAction from "@/components/base/Button/ButtonAction";
import PageContainer from "@base/Layout/PageContainer";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";
import colors from "@/styles/colors";

const BOARDGAME_DETAIL_ENDPOINT = "/api/boardgames";

type BoardgameDetail = {
  id: number | null;
  boardgameName: string;
  ownerName: string;
  peopleMin: string;
  peopleMax: string;
  needTime: string;
  urlStr: string;
  imageUrl1: string;
  imageUrl2: string;
  howToPlay: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
};

type DetailField = {
  label: string;
  value: string;
};

type BoardgameDetailResponse = {
  id: number | null;
  boardgameName: string | null;
  ownerName: string | null;
  peopleMin: number | null;
  peopleMax: number | null;
  needTime: number | null;
  urlStr: string | null;
  imageUrl1: string | null;
  imageUrl2: string | null;
  howToPlay: string | null;
  remarks: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type BoardgameUpdateRequest = {
  boardgameName: string | null;
  ownerName: string | null;
  peopleMin: number | null;
  peopleMax: number | null;
  needTime: number | null;
  urlStr: string | null;
  imageUrl1: string | null;
  imageUrl2: string | null;
  howToPlay: string | null;
  remarks: string | null;
};

const EMPTY_BOARDGAME: BoardgameDetail = {
  id: null,
  boardgameName: "",
  ownerName: "",
  peopleMin: "",
  peopleMax: "",
  needTime: "",
  urlStr: "",
  imageUrl1: "",
  imageUrl2: "",
  howToPlay: "",
  remarks: "",
  createdAt: "",
  updatedAt: "",
};

type EditableBoardgameField =
  | "boardgameName"
  | "ownerName"
  | "peopleMin"
  | "peopleMax"
  | "needTime"
  | "urlStr"
  | "imageUrl1"
  | "imageUrl2"
  | "howToPlay"
  | "remarks";

const getQueryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

const getQueryNumber = (value: string | string[] | undefined): number | null => {
  const text = getQueryValue(value).trim();
  if (!text) {
    return null;
  }

  const parsed = Number(text);
  return Number.isInteger(parsed) ? parsed : null;
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

const mergeBoardgameResponse = (
  current: BoardgameDetail,
  response: BoardgameDetailResponse
): BoardgameDetail => ({
  ...current,
  id: response.id ?? current.id,
  boardgameName: response.boardgameName ?? "",
  ownerName: response.ownerName ?? "",
  peopleMin: response.peopleMin === null ? "" : String(response.peopleMin),
  peopleMax: response.peopleMax === null ? "" : String(response.peopleMax),
  needTime: response.needTime === null ? "" : String(response.needTime),
  urlStr: response.urlStr ?? "",
  imageUrl1: response.imageUrl1 ?? "",
  imageUrl2: response.imageUrl2 ?? "",
  howToPlay: response.howToPlay ?? "",
  remarks: response.remarks ?? "",
  createdAt: response.createdAt ?? current.createdAt,
  updatedAt: response.updatedAt ?? current.updatedAt,
});

const BoardgameDetailPage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [boardgame, setBoardgame] = useState<BoardgameDetail>(EMPTY_BOARDGAME);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const boardgameName = getQueryValue(router.query.boardgameName || router.query.boardgame_name);
    const ownerName = getQueryValue(router.query.ownerName || router.query.owner_name);
    const peopleMin = getQueryValue(router.query.peopleMin || router.query.people_min);
    const peopleMax = getQueryValue(router.query.peopleMax || router.query.people_max);
    const needTime = getQueryValue(router.query.needTime || router.query.need_time);
    const urlStr = getQueryValue(router.query.urlStr || router.query.url_str);
    const imageUrl1 = getQueryValue(router.query.imageUrl1 || router.query.image_url1);
    const imageUrl2 = getQueryValue(router.query.imageUrl2 || router.query.image_url2);
    const howToPlay = getQueryValue(router.query.howToPlay || router.query.how_to_play);
    const remarks = getQueryValue(router.query.remarks);
    const id = getQueryNumber(router.query.id);

    setBoardgame({
      id,
      boardgameName,
      ownerName,
      peopleMin,
      peopleMax,
      needTime,
      urlStr,
      imageUrl1,
      imageUrl2,
      howToPlay,
      remarks,
      createdAt: getQueryValue(router.query.createdAt),
      updatedAt: getQueryValue(router.query.updatedAt),
    });

    if (id === null) {
      return;
    }

    let ignore = false;
    void apiService
      .get<BoardgameDetailResponse>(`${BOARDGAME_DETAIL_ENDPOINT}/${id}`)
      .then((latest) => {
        if (!ignore) {
          setBoardgame((current) => mergeBoardgameResponse(current, latest));
        }
      })
      .catch((error) => {
        console.error("Fetch boardgame failed:", error);
      });

    return () => {
      ignore = true;
    };
  }, [router.isReady, router.query]);

  const handleTextChange = useCallback(
    (field: EditableBoardgameField) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setBoardgame((current) => ({
          ...current,
          [field]: event.target.value,
        }));
      },
    []
  );

  const handleUpdate = useCallback(async () => {
    if (boardgame.id === null) {
      showSnackbar(getMessage(MessageCodes.DATA_NOT_FOUND), "ERROR");
      return;
    }

    if (
      isInvalidPositiveIntegerInput(boardgame.peopleMin) ||
      isInvalidPositiveIntegerInput(boardgame.peopleMax) ||
      isInvalidPositiveIntegerInput(boardgame.needTime)
    ) {
      showSnackbar("人数と目安時間は正の整数で入力してください。", "ERROR");
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await apiService.put<BoardgameDetailResponse>(
        `${BOARDGAME_DETAIL_ENDPOINT}/${boardgame.id}`,
        {
          boardgameName: boardgame.boardgameName.trim() || null,
          ownerName: boardgame.ownerName.trim() || null,
          peopleMin: toNullableNumber(boardgame.peopleMin),
          peopleMax: toNullableNumber(boardgame.peopleMax),
          needTime: toNullableNumber(boardgame.needTime),
          urlStr: boardgame.urlStr.trim() || null,
          imageUrl1: boardgame.imageUrl1.trim() || null,
          imageUrl2: boardgame.imageUrl2.trim() || null,
          howToPlay: boardgame.howToPlay.trim() || null,
          remarks: boardgame.remarks.trim() || null,
        } satisfies BoardgameUpdateRequest
      );

      setBoardgame((current) => mergeBoardgameResponse(current, updated));
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "ボードゲーム情報を更新"), "SUCCESS");
    } catch (error) {
      console.error("Update boardgame failed:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ボードゲーム情報の更新"), "ERROR");
    } finally {
      setIsUpdating(false);
    }
  }, [boardgame, showSnackbar]);

  const handleBack = useCallback(() => router.push("/boardgames"), [router]);

  const fields: DetailField[] = useMemo(
    () => [
      { label: "ID", value: boardgame.id === null ? "" : String(boardgame.id) },
      { label: "作成日時", value: boardgame.createdAt },
      { label: "更新日時", value: boardgame.updatedAt },
    ],
    [boardgame.createdAt, boardgame.id, boardgame.updatedAt]
  );

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 32px, 1280px)", maxWidth: "100%", mx: "auto", gap: 2 }}>
        <Box sx={{ width: "100%", gap: 0.5 }}>
          <Font20>ボードゲーム詳細</Font20>
          <Font14 sx={{ color: colors.grayDark }}>一覧で選択したボードゲーム情報</Font14>
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
                name="boardgameName"
                value={boardgame.boardgameName}
                size="small"
                fullWidth
                onChange={handleTextChange("boardgameName")}
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
                name="ownerName"
                value={boardgame.ownerName}
                size="small"
                fullWidth
                onChange={handleTextChange("ownerName")}
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
                name="peopleMin"
                value={boardgame.peopleMin}
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
                onChange={handleTextChange("peopleMin")}
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
                name="peopleMax"
                value={boardgame.peopleMax}
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
                onChange={handleTextChange("peopleMax")}
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
                name="needTime"
                value={boardgame.needTime}
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
                onChange={handleTextChange("needTime")}
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
                name="urlStr"
                value={boardgame.urlStr}
                size="small"
                fullWidth
                onChange={handleTextChange("urlStr")}
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
              画像URL1
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="imageUrl1"
                value={boardgame.imageUrl1}
                size="small"
                fullWidth
                onChange={handleTextChange("imageUrl1")}
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
              画像URL2
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="imageUrl2"
                value={boardgame.imageUrl2}
                size="small"
                fullWidth
                onChange={handleTextChange("imageUrl2")}
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
                name="howToPlay"
                value={boardgame.howToPlay}
                size="small"
                fullWidth
                multiline
                minRows={3}
                onChange={handleTextChange("howToPlay")}
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
                name="remarks"
                value={boardgame.remarks}
                size="small"
                fullWidth
                multiline
                minRows={3}
                onChange={handleTextChange("remarks")}
              />
            </Box>
          </Box>
        </Box>

        {fields.map((field) => (
          <Box
            key={field.label}
            sx={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
              border: `1.5px solid ${colors.commonBorderGray}`,
              borderRadius: 1,
              overflow: "hidden",
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
              {field.label}
            </Box>
            <Box
              sx={{
                width: "100%",
                minWidth: 0,
                p: 1.5,
                color: colors.commonFontColorBlack,
                overflowWrap: "anywhere",
              }}
            >
              {field.value || "-"}
            </Box>
          </Box>
        ))}

        <Box sx={{ width: "100%", flexDirection: "row", gap: 1.5, alignItems: "center" }}>
          <ButtonAction label="戻る" color="secondary" onClick={handleBack} />
          <ButtonAction
            label="更新"
            onClick={handleUpdate}
            disabled={isUpdating || boardgame.id === null}
          />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default BoardgameDetailPage;
