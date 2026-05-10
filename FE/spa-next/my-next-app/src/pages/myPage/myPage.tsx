import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextField } from "@mui/material";
import apiClient from "@/api/apiClient";
import { ControllableListView } from "@/components/composite";
import type { TableState } from "@/components/composite/Listview/ControllableListView";
import type { ColumnDefinition, RowDefinition } from "@/components/composite/Listview/ListView";
import PageContainer from "@base/Layout/PageContainer";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import colors from "@/styles/colors";
import { useAuth } from "@/hooks/useAuth";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";

type MypageApiResponse = {
  userId: number;
  imageUrl?: string | null;
  userName: string | null;
  enthusiasm: string | null;
  hopeStyle: string | null;
  remarks: string | null;
  createAt: string | null;
  updateAt: string | null;
};

type MypageDisplayRow = {
  label: "image_url" | "user_id" | "user_name" | "enthusiasm" | "hope_style" | "remarks";
  value: string;
};

type MypageEditState = {
  imageUrl: string;
  userName: string;
  enthusiasm: string;
  hopeStyle: string;
  remarks: string;
};

const columns: ColumnDefinition[] = [
  { id: "label", label: "項目", display: true, sortable: false, align: "left", widthPercent: 28 },
  { id: "value", label: "内容", display: true, sortable: false, align: "left", widthPercent: 72 },
];

const getValue = (value: string | null | undefined): string => value ?? "";

const myPagePage: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { userId, refreshAuth, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [row, setRow] = useState<MypageApiResponse | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [editState, setEditState] = useState<MypageEditState>({
    imageUrl: "",
    userName: "",
    enthusiasm: "",
    hopeStyle: "",
    remarks: "",
  });
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    rowsPerPage: 10,
    sortParams: {
      sortColumn: "",
      sortOrder: false,
    },
  });

  useEffect(() => {
    refreshAuth(true);
  }, [refreshAuth]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    const fetchMypage = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<MypageApiResponse>(`/api/mypage/${userId}`);
        setRow(response.data);
        setEditState({
          imageUrl: getValue(response.data.imageUrl),
          userName: getValue(response.data.userName),
          enthusiasm: getValue(response.data.enthusiasm),
          hopeStyle: getValue(response.data.hopeStyle),
          remarks: getValue(response.data.remarks),
        });
      } catch (error) {
        console.error("Failed to fetch mypage:", error);
        showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "マイページ"), "ERROR");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMypage();
  }, [isAuthenticated, showSnackbar, userId]);

  const rowData: RowDefinition[] = useMemo(() => {
    if (!row) {
      return [];
    }

    const displayRows: MypageDisplayRow[] = [
      { label: "image_url", value: isEditing ? editState.imageUrl : getValue(row.imageUrl) },
      { label: "user_id", value: String(row.userId) },
      { label: "user_name", value: isEditing ? editState.userName : getValue(row.userName) },
      { label: "enthusiasm", value: isEditing ? editState.enthusiasm : getValue(row.enthusiasm) },
      { label: "hope_style", value: isEditing ? editState.hopeStyle : getValue(row.hopeStyle) },
      { label: "remarks", value: isEditing ? editState.remarks : getValue(row.remarks) },
    ];

    return displayRows.map((item) => ({
      rowSx: { cursor: "default" },
      cells: [
        {
          id: `${item.label}-label`,
          columnId: "label",
          cell: item.label,
          value: item.label,
        },
        {
          id: `${item.label}-value`,
          columnId: "value",
          cell:
            item.label === "image_url" ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <ButtonAction
                  label="ファイル選択"
                  disabled={!isEditing}
                  onClick={() => imageInputRef.current?.click()}
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={!isEditing}
                  onChange={async (event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (!file) {
                      return;
                    }

                    setSelectedImageName(file.name);

                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = reader.result;
                      if (typeof result === "string") {
                        setEditState((current) => ({
                          ...current,
                          imageUrl: result,
                        }));
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <Font14 sx={{ color: colors.grayDark }}>
                  {selectedImageName || item.value || "未設定"}
                </Font14>
              </Box>
            ) : isEditing && item.label !== "user_id" ? (() => {
              const field =
                item.label === "user_name"
                  ? "userName"
                  : item.label === "enthusiasm"
                    ? "enthusiasm"
                    : item.label === "hope_style"
                      ? "hopeStyle"
                      : "remarks";

              return (
                <TextField
                  value={item.value}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setEditState((current) => ({
                      ...current,
                      [field]: nextValue,
                    }));
                  }}
                  size="small"
                  fullWidth
                  multiline={item.label === "remarks"}
                  minRows={item.label === "remarks" ? 3 : undefined}
                />
              );
            })() : (
              item.value || "-"
            ),
          value: item.value,
        },
      ],
    }));
  }, [editState, isEditing, row]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    if (!row) {
      setIsEditing(false);
      return;
    }
      setEditState({
        imageUrl: getValue(row.imageUrl),
        userName: getValue(row.userName),
        enthusiasm: getValue(row.enthusiasm),
        hopeStyle: getValue(row.hopeStyle),
        remarks: getValue(row.remarks),
      });
      setSelectedImageName("");
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      setIsEditing(false);
  }, [row]);

  const handleUpdate = useCallback(async () => {
    if (!userId) {
      showSnackbar(getMessage(MessageCodes.DATA_NOT_FOUND), "ERROR");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await apiClient.put<MypageApiResponse>(`/api/mypage/${userId}`, {
        imageUrl: editState.imageUrl.trim() ? editState.imageUrl : null,
        userName: editState.userName.trim() ? editState.userName : null,
        enthusiasm: editState.enthusiasm.trim() ? editState.enthusiasm : null,
        hopeStyle: editState.hopeStyle.trim() ? editState.hopeStyle : null,
        remarks: editState.remarks.trim() ? editState.remarks : null,
      });

      setRow(response.data);
      setEditState({
        imageUrl: getValue(response.data.imageUrl),
        userName: getValue(response.data.userName),
        enthusiasm: getValue(response.data.enthusiasm),
        hopeStyle: getValue(response.data.hopeStyle),
        remarks: getValue(response.data.remarks),
      });
      setSelectedImageName("");
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      setIsEditing(false);
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "マイページを更新"), "SUCCESS");
    } catch (error) {
      console.error("Failed to update mypage:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "マイページの更新"), "ERROR");
    } finally {
      setIsUpdating(false);
    }
  }, [editState, showSnackbar, userId]);

  const searchOptions = useMemo(
    () => ({
      title: "マイページ",
      elements: (
        <Box sx={{ p: 2, color: colors.grayDark, lineHeight: 1.8 }}>
          <Font14 sx={{ color: colors.grayDark }}>
            {isLoading ? "読み込み中です。" : "自分のプロフィール情報を表示しています。"}
          </Font14>
        </Box>
      ),
      accordionSx: { width: "100%" },
    }),
    [isLoading]
  );

  const handleTableStateChange = useCallback((state: TableState) => {
    setTableState(state);
  }, []);

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 32px, 960px)", mx: "auto", py: 2 }}>
        <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <Font20>マイページ</Font20>
          <Font14 sx={{ color: colors.grayDark }}>
            日付データ以外の項目を一覧表示しています。
          </Font14>
        </Box>

        <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {isEditing ? (
            <>
              <ButtonAction label={isUpdating ? "更新中..." : "更新"} onClick={handleUpdate} disabled={isUpdating} />
              <ButtonAction label="キャンセル" color="secondary" onClick={handleCancel} disabled={isUpdating} />
            </>
          ) : (
            <ButtonAction label="編集" onClick={handleEdit} disabled={!row} />
          )}
        </Box>

        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          onTableStateChange={handleTableStateChange}
          rowsPerPageOptions={[10]}
          rowData={rowData}
          totalRowCount={rowData.length}
          columns={columns}
          searchOptions={searchOptions}
          showSearchOptions={true}
          topPaginationHidden
          bottomPaginationHidden
        />
      </Box>
    </PageContainer>
  );
};

export default myPagePage;
