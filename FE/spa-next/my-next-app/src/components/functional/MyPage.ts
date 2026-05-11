import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextField } from "@mui/material";
import apiClient from "@/api/apiClient";
import { uploadFileApi } from "@/api/services/v1/fileService";
import KeyValueList, { type KeyValueListItem } from "@/components/composite/KeyValueList";
import PageContainer from "@base/Layout/PageContainer";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import colors from "@/styles/colors";
import { useAuth } from "@/hooks/useAuth";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";

const toLinkHref = (url: string): string => {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url) || url.startsWith("/")) {
    return url;
  }
  return `https://${url}`;
};

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

type MypageEditState = {
  imageUrl: string;
  userName: string;
  enthusiasm: string;
  hopeStyle: string;
  remarks: string;
};

const getValue = (value: string | null | undefined): string => value ?? "";

const MyPage: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { userId, refreshAuth, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [row, setRow] = useState<MypageApiResponse | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [editState, setEditState] = useState<MypageEditState>({
    imageUrl: "",
    userName: "",
    enthusiasm: "",
    hopeStyle: "",
    remarks: "",
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

  const items: KeyValueListItem[] = useMemo(() => {
    if (!row) {
      return [];
    }

    const imageValue = isEditing ? editState.imageUrl : getValue(row.imageUrl);
    const imagePreview = imageValue.trim() ? (
      <img
        src={toLinkHref(imageValue.trim())}
        alt="マイページ画像"
        style={{
          width: 180,
          height: 180,
          objectFit: "cover",
          border: `1px solid ${colors.commonBorderGray}`,
          borderRadius: "4px",
          backgroundColor: colors.commonFontColorWhite,
        }}
      />
    ) : (
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 180,
          height: 180,
          border: `1px solid ${colors.commonBorderGray}`,
          borderRadius: "4px",
          color: colors.grayDark,
          fontSize: "0.75rem",
          backgroundColor: colors.commonFontColorWhite,
        }}
      >
        -
      </Box>
    );
    const imageNode = (
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
            setSelectedImageFile(file);
            setEditState((current) => ({
              ...current,
              imageUrl: file.name,
            }));
          }}
        />
        <Font14 sx={{ color: colors.grayDark }}>
          {selectedImageName || imageValue || "未設定"}
        </Font14>
      </Box>
    );

    const editableTextNode = (
      field: keyof Pick<MypageEditState, "userName" | "enthusiasm" | "hopeStyle" | "remarks">,
      multiline = false
    ) => (
      <TextField
        value={editState[field]}
        onChange={(event) => {
          const nextValue = event.target.value;
          setEditState((current) => ({
            ...current,
            [field]: nextValue,
          }));
        }}
        size="small"
        fullWidth
        multiline={multiline}
        minRows={multiline ? 3 : undefined}
      />
    );

    return [
      {
        key: "image_url",
        label: "画像",
        value: isEditing ? imageNode : imagePreview,
        rowSx: { alignItems: "flex-start" },
      },
      {
        key: "user_id",
        label: "ユーザーID",
        value: row.userId,
      },
      {
        key: "user_name",
        label: "ユーザー名",
        value: isEditing ? editableTextNode("userName") : getValue(row.userName),
      },
      {
        key: "enthusiasm",
        label: "意気込み",
        value: isEditing ? editableTextNode("enthusiasm") : getValue(row.enthusiasm),
      },
      {
        key: "hope_style",
        label: "目指すスタイル",
        value: isEditing ? editableTextNode("hopeStyle") : getValue(row.hopeStyle),
      },
      {
        key: "remarks",
        label: "備考",
        value: isEditing ? editableTextNode("remarks", true) : getValue(row.remarks),
      },
    ];
  }, [editState, isEditing, row, selectedImageName]);

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
    setSelectedImageFile(null);
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
      let imageUrl = editState.imageUrl.trim() ? editState.imageUrl : null;
      if (selectedImageFile) {
        const uploaded = await uploadFileApi(selectedImageFile, "MYPAGE");
        imageUrl = uploaded.data.fileId;
      }

      const response = await apiClient.put<MypageApiResponse>(`/api/mypage/${userId}`, {
        imageUrl,
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
      setSelectedImageFile(null);
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
  }, [editState, selectedImageFile, showSnackbar, userId]);

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 32px, 1152px)", maxWidth: "95%", py: 2, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Font20>マイページ</Font20>
          <Font14 sx={{ color: colors.grayDark }}>
            自分のプロフィール情報を表示しています。
          </Font14>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          {isEditing ? (
            <>
              <ButtonAction label={isUpdating ? "更新中..." : "更新"} onClick={handleUpdate} disabled={isUpdating} />
              <ButtonAction label="キャンセル" color="secondary" onClick={handleCancel} disabled={isUpdating} />
            </>
          ) : (
            <ButtonAction label="編集" onClick={handleEdit} disabled={!row} />
          )}
        </Box>

        {isLoading ? (
          <Font14 sx={{ color: colors.grayDark }}>読み込み中です。</Font14>
        ) : (
          <KeyValueList items={items} maxWidth="1200px" />
        )}
      </Box>
    </PageContainer>
  );
};

export default MyPage;
