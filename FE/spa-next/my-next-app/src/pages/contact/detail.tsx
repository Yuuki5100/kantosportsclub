import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, TextField } from "@mui/material";
import PageContainer from "@base/Layout/PageContainer";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { Font14, Font20 } from "@/components/base";
import colors from "@/styles/colors";
import apiClient from "@/api/apiClient";
import AutoComplete from "@/components/base/Input/AutoComplete";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";

type Option = {
  label: string;
  value: string;
};

const TYPE_OPTIONS: Option[] = [
  { label: "不具合", value: "不具合" },
  { label: "要望", value: "要望" },
  { label: "その他", value: "その他" },
];

const STATUS_OPTIONS: Option[] = [
  { label: "未対応", value: "未対応" },
  { label: "対応中", value: "対応中" },
  { label: "完了", value: "完了" },
];

const DISPLAY_OPTIONS: Option[] = [
  { label: "表示", value: "表示" },
  { label: "非表示", value: "非表示" },
];

type ContactDetail = {
  id: string;
  type: string;
  status: string;
  display: string | null;
  sentence: string;
  reporter: string;
  createdAt: string | null;
  updatedAt: string | null;
};

type ContactUpdateRequest = {
  type: string;
  status: string;
  display: string | null;
  sentence: string;
  reporter: string;
};

const EMPTY_CONTACT: ContactDetail = {
  id: "",
  type: "",
  status: "",
  display: "",
  sentence: "",
  reporter: "",
  createdAt: "",
  updatedAt: "",
};

const getQueryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

const ContactDetailPage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [contact, setContact] = useState<ContactDetail>(EMPTY_CONTACT);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const id = getQueryValue(router.query.id);
    setContact({
      id,
      type: getQueryValue(router.query.type),
      status: getQueryValue(router.query.status),
      display: getQueryValue(router.query.display),
      sentence: getQueryValue(router.query.sentence),
      reporter: getQueryValue(router.query.reporter),
      createdAt: getQueryValue(router.query.createdAt),
      updatedAt: getQueryValue(router.query.updatedAt),
    });

    if (!id) {
      return;
    }

    let ignore = false;
    setIsLoading(true);
    void apiClient
      .get<ContactDetail>(`/api/contacts/${id}`)
      .then((response) => {
        if (!ignore) {
          const latest = response.data;
          setContact({
            id: latest.id ?? id,
            type: latest.type ?? "",
            status: latest.status ?? "",
            display: latest.display ?? "",
            sentence: latest.sentence ?? "",
            reporter: latest.reporter ?? "",
            createdAt: latest.createdAt ?? "",
            updatedAt: latest.updatedAt ?? "",
          });
        }
      })
      .catch((error) => {
        console.error("Failed to fetch contact detail:", error);
        showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "問い合わせ詳細"), "ERROR");
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [router.isReady, router.query, showSnackbar]);

  const handleChange =
    (field: "sentence" | "reporter") =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContact((current) => ({
          ...current,
          [field]: event.target.value,
        }));
      };

  const handleBack = useCallback(() => {
    void router.push("/contact");
  }, [router]);

  const handleUpdate = useCallback(async () => {
    if (!contact.id) {
      return;
    }

    setIsUpdating(true);
    try {
      const payload: ContactUpdateRequest = {
        type: contact.type.trim(),
        status: contact.status.trim(),
        display: contact.display?.trim() ? contact.display.trim() : null,
        sentence: contact.sentence.trim(),
        reporter: contact.reporter.trim(),
      };

      const response = await apiClient.put<ContactDetail>(`/api/contacts/${contact.id}`, payload);
      const updated = response.data;
      setContact({
        id: updated.id ?? contact.id,
        type: updated.type ?? "",
        status: updated.status ?? "",
        display: updated.display ?? "",
        sentence: updated.sentence ?? "",
        reporter: updated.reporter ?? "",
        createdAt: updated.createdAt ?? contact.createdAt ?? "",
        updatedAt: updated.updatedAt ?? contact.updatedAt ?? "",
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "問い合わせを更新"), "SUCCESS");
    } catch (error) {
      console.error("Failed to update contact:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "問い合わせの更新"), "ERROR");
    } finally {
      setIsUpdating(false);
    }
  }, [contact, showSnackbar]);

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 64px, 1200px)", maxWidth: "100%", mx: "auto", py: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          <Font20>問い合わせ詳細</Font20>
          <Font14 sx={{ color: colors.grayDark }}>
            一覧から選択した contact を編集します。
          </Font14>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            p: 2,
            border: `1.5px solid ${colors.commonBorderGray}`,
            borderRadius: 1,
            bgcolor: colors.commonFontColorWhite,
          }}
        >
          {/* <TextField label="id" value={contact.id} fullWidth disabled /> */}
          <AutoComplete
            name="contactType"
            id="contactType"
            options={TYPE_OPTIONS}
            defaultValue={contact.type}
            freeSolo
            helperText="種別を選択または入力してください"
            onChange={(option) => {
              setContact((current) => ({ ...current, type: option?.value ?? "" }));
            }}
            onInputChange={(value) => {
              setContact((current) => ({ ...current, type: value }));
            }}
            customStyle={{ mt: 0 }}
          />
          <AutoComplete
            name="contactStatus"
            id="contactStatus"
            options={STATUS_OPTIONS}
            defaultValue={contact.status}
            freeSolo
            helperText="状態を選択または入力してください"
            onChange={(option) => {
              setContact((current) => ({ ...current, status: option?.value ?? "" }));
            }}
            onInputChange={(value) => {
              setContact((current) => ({ ...current, status: value }));
            }}
            customStyle={{ mt: 0 }}
          />
          <AutoComplete
            name="contactDisplay"
            id="contactDisplay"
            options={DISPLAY_OPTIONS}
            defaultValue={contact.display ?? ""}
            freeSolo
            helperText="表示設定を選択または入力してください"
            onChange={(option) => {
              setContact((current) => ({ ...current, display: option?.value ?? "" }));
            }}
            onInputChange={(value) => {
              setContact((current) => ({ ...current, display: value }));
            }}
            customStyle={{ mt: 0 }}
          />
          <TextField
            label="sentence"
            value={contact.sentence}
            onChange={handleChange("sentence")}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="reporter"
            value={contact.reporter}
            onChange={handleChange("reporter")}
            fullWidth
            disabled={true}
          />
          <TextField label="createdAt" value={contact.createdAt ?? ""} fullWidth disabled />
          <TextField label="updatedAt" value={contact.updatedAt ?? ""} fullWidth disabled />

          <Box sx={{ display: "flex", gap: 1 }}>
            <ButtonAction
              label={isUpdating ? "更新中..." : "更新"}
              onClick={handleUpdate}
              disabled={isUpdating || isLoading}
            />
            <ButtonAction label="戻る" color="secondary" onClick={handleBack} disabled={isUpdating} />
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default ContactDetailPage;
