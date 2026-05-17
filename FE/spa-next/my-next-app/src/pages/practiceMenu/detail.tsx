import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Font14, Font20 } from "@/components/base";
import PageContainer from "@base/Layout/PageContainer";
import colors from "@/styles/colors";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { TextField } from "@mui/material";
import { apiService } from "@/api/apiService";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";
import { useAuth } from "@/hooks/useAuth";

type PracticeMenuDetail = {
  id: string;
  title: string;
  remarks: string;
  updater: string;
  created_at: string;
  updated_at: string;
};

type MenuItem = {
  id: string;
  name: string;
  time: string;
};

type PracticeMenuHeaderWithDetailsResponse = {
  id: number;
  title: string | null;
  remarks: string | null;
  updater: string | null;
  created_at: string;
  updated_at: string;
  details: Array<{
    id: number;
    headerId: number;
    category: string | null;
    menuName: string;
    menuTime: number | null;
    sortNo: number;
    updater: string | null;
    created_at: string;
    updated_at: string;
  }>;
};

type PracticeMenuDetailUpdateRequest = {
  category: string | null;
  menuName: string;
  menuTime: number | null;
  sortNo: number;
  updater: string | null;
};

type DetailField = {
  label: string;
  value: string;
  field?: keyof PracticeMenuDetail;
};

const EMPTY_DETAIL: PracticeMenuDetail = {
  id: "",
  title: "",
  remarks: "",
  updater: "",
  created_at: "",
  updated_at: "",
};

const getQueryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

const PracticeMenuDetailPage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { name: loginUserName } = useAuth();
  const [detail, setDetail] = useState<PracticeMenuDetail>(EMPTY_DETAIL);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const fetchDetail = async () => {
      const id = getQueryValue(router.query.id);
      if (!id) {
        showSnackbar(getMessage(MessageCodes.DATA_NOT_FOUND), "ERROR");
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiService.get<PracticeMenuHeaderWithDetailsResponse>(
          `${API_ENDPOINTS.PRACTICE_MENU.HEADER_LIST}/${id}`
        );

        setDetail({
          id: String(response.id),
          title: response.title ?? "",
          remarks: response.remarks ?? "",
          updater: response.updater ?? "",
          created_at: response.created_at ?? "",
          updated_at: response.updated_at ?? "",
        });
        setMenuItems(
          (response.details ?? []).map((item) => ({
            id: String(item.id),
            name: item.menuName,
            time: item.menuTime === null ? "" : String(item.menuTime),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch practice menu detail:", error);
        showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "練習メニュー詳細"), "ERROR");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDetail();
  }, [router.isReady, router.query.id, showSnackbar]);

  const updateDetailField = (field: "title" | "remarks", value: string) => {
    setDetail((current) => ({ ...current, [field]: value }));
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    setMenuItems((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addMenuItem = () => {
    setMenuItems((current) => [
      ...current,
      {
        id: `new-${Date.now()}-${current.length}`,
        name: "",
        time: "",
      },
    ]);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems((current) => current.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!detail.id || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const payload: {
        title: string;
        remarks: string | null;
        updater: string | null;
        details: PracticeMenuDetailUpdateRequest[];
      } = {
        title: detail.title.trim(),
        remarks: detail.remarks.trim() || null,
        updater: detail.updater.trim() || null,
        details: menuItems
          .filter((item) => item.name.trim())
          .map((item, index) => ({
            category: null,
            menuName: item.name.trim(),
            menuTime: item.time.trim() ? Number(item.time) : null,
            sortNo: index + 1,
            updater: loginUserName ?? null,
          })),
      };

      await apiService.put(
        `${API_ENDPOINTS.PRACTICE_MENU.HEADER_LIST}/${detail.id}`,
        payload
      );
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "練習メニューを更新"), "SUCCESS");
    } catch (error) {
      console.error("Failed to update practice menu:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "練習メニューの更新"), "ERROR");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 60px, 1200px)", maxWidth: "100%", mx: "auto", py: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
          <Box sx={{ width: "100%", gap: 0.5 }}>
            <Font20>練習メニュー詳細</Font20>
            <Font14 sx={{ color: colors.grayDark }}>一覧で選択した練習メニュー</Font14>
            <Font14 sx={{ color: colors.grayDark }}>
              {isLoading ? "読み込み中です。" : detail.title || "-"}
            </Font14>
          </Box>
          <ButtonAction
            label="一覧へ戻る"
            size="medium"
            onClick={() => void router.push("/practiceMenu")}
            width={140}
            sx={{
              backgroundColor: "commonTableHeader",
              color: "#ffffff",
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              "&:hover": {
                backgroundColor: "commonTableHeader",
              },
            }}
          />
        </Box>

        <Box
          sx={{
            width: "100%",
            border: `1.5px solid ${colors.commonBorderGray}`,
            borderRadius: 1,
            overflow: "hidden",
            mb: 3,
          }}
        >
          {[
            { label: "タイトル", value: detail.title, field: "title" as const },
            { label: "備考", value: detail.remarks, field: "remarks" as const },
            { label: "更新者", value: detail.updater, isLabel: true },
          ].map((item: DetailField & { isLabel?: boolean }) => (
            <Box
              key={item.label}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
                width: "100%",
                borderBottom: `1.5px solid ${colors.commonBorderGray}`,
                "&:last-of-type": {
                  borderBottom: "none",
                },
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
                {item.label}
              </Box>
              <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
                {item.isLabel ? (
                  <Font14 sx={{ minHeight: 40, display: "flex", alignItems: "center" }}>
                    {item.value || "-"}
                  </Font14>
                ) : (
                  <TextField
                    value={item.value}
                    size="small"
                    fullWidth
                    onChange={
                      item.field
                        ? (event) => updateDetailField(item.field as "title" | "remarks", event.target.value)
                        : undefined
                    }
                  />
                )}
              </Box>
            </Box>
          ))}
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
              今日のメニュー
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {menuItems.length === 0 ? (
                  <Font14 sx={{ color: colors.grayDark }}>
                    メニューはまだ登録されていません。
                  </Font14>
                ) : (
                  menuItems.map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) 120px 40px",
                        alignItems: "center",
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: colors.commonFontColorWhite,
                        border: `1px solid ${colors.commonBorderGray}`,
                        gap: 1,
                      }}
                    >
                      <TextField
                        size="small"
                        value={item.name}
                        onChange={(event) => updateMenuItem(index, "name", event.target.value)}
                        placeholder="練習名"
                        fullWidth
                      />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TextField
                          size="small"
                          value={item.time}
                          onChange={(event) => updateMenuItem(index, "time", event.target.value)}
                          placeholder="時間"
                          sx={{
                            width: 120,
                            "& .MuiInputBase-input": {
                              fontSize: 14,
                              py: 0.75,
                            },
                          }}
                        />
                      </Box>
                      <ButtonAction
                        label="削除"
                        size="small"
                        onClick={() => removeMenuItem(index)}
                        width={40}
                        sx={{
                          minWidth: 40,
                          backgroundColor: "commonTableHeader",
                          color: "#ffffff",
                          borderRadius: 2,
                          px: 0,
                        }}
                      />
                    </Box>
                  ))
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <ButtonAction
                  label="メニュー追加"
                  size="medium"
                  onClick={addMenuItem}
                  width={120}
                  sx={{
                    backgroundColor: "commonTableHeader",
                    color: "#ffffff",
                    borderRadius: 2,
                  }}
                />
                <ButtonAction
                  label={isSaving ? "更新中" : "更新する"}
                  size="medium"
                  onClick={() => void handleSave()}
                  width={120}
                  sx={{
                    backgroundColor: "commonTableHeader",
                    color: "#ffffff",
                    borderRadius: 2,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default PracticeMenuDetailPage;
