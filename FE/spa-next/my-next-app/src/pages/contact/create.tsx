import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import PageContainer from "@base/Layout/PageContainer";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { Font14, Font20 } from "@/components/base";
import colors from "@/styles/colors";
import apiClient from "@/api/apiClient";
import AutoComplete from "@/components/base/Input/AutoComplete";
import { useAuth } from "@/hooks/useAuth";
import { getPageConfig } from "@/config/PageConfig";

type ContactCreateRequest = {
  type: string;
  status: string;
  display: string | null;
  sentence: string;
  reporter: string;
};

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
  { label: "起票", value: "未対応" },
  { label: "対応中", value: "対応中" },
  { label: "完了", value: "完了" },
];

const DISPLAY_OPTIONS: Option[] = getPageConfig()
  .filter((item) => !item.hidden)
  .map((item) => ({
    label: item.name,
    value: item.name,
  }));

const ContactCreatePage: React.FC = () => {
  const router = useRouter();
  const { name: loginUserName } = useAuth();
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [display, setDisplay] = useState("");
  const [sentence, setSentence] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const reporter = useMemo(() => loginUserName ?? "", [loginUserName]);

  const handleBack = useCallback(() => {
    void router.push("/contact");
  }, [router]);

  const handleCreate = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload: ContactCreateRequest = {
        type: type.trim(),
        status: status.trim(),
        display: display.trim() ? display.trim() : null,
        sentence: sentence.trim(),
        reporter: reporter.trim(),
      };

      await apiClient.post("/api/contacts", payload);
      void router.push("/contact");
    } catch (error) {
      console.error("Failed to create contact:", error);
    } finally {
      setIsSaving(false);
    }
  }, [display, reporter, router, sentence, status, type]);

  const isValid = Boolean(type.trim() && status.trim() && sentence.trim() && reporter.trim());

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 64px, 1200px)", maxWidth: "100%", mx: "auto", py: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          <Font20>問い合わせ新規作成</Font20>
          <Font14 sx={{ color: colors.grayDark }}>
            contact テーブルへ新規登録します。投稿者はログイン中のユーザー名を自動保存します。
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
          <AutoComplete
            name="contactType"
            id="contactType"
            options={TYPE_OPTIONS}
            defaultValue={type}
            freeSolo
            helperText="種別を選択または入力してください"
            onChange={(option) => setType(option?.value ?? "")}
            onInputChange={(value) => setType(value)}
            customStyle={{ mt: 0 }}
          />

          <AutoComplete
            name="contactStatus"
            id="contactStatus"
            options={STATUS_OPTIONS}
            defaultValue={status}
            freeSolo
            helperText="状態を選択または入力してください"
            onChange={(option) => setStatus(option?.value ?? "")}
            onInputChange={(value) => setStatus(value)}
            customStyle={{ mt: 0 }}
          />

          <AutoComplete
            name="contactDisplay"
            id="contactDisplay"
            options={DISPLAY_OPTIONS}
            defaultValue={display}
            freeSolo
            helperText="表示設定を選択または入力してください"
            onChange={(option) => setDisplay(option?.value ?? "")}
            onInputChange={(value) => setDisplay(value)}
            customStyle={{ mt: 0 }}
          />

          <Box>
            <Box sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}>sentence</Box>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "4px",
                border: `1px solid ${colors.commonBorderGray}`,
                fontFamily: "inherit",
              }}
            />
          </Box>

          {/* <Box sx={{ display: "grid", gap: 0.5 }}>
            <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>reporter</Box>
            <Box sx={{ minHeight: "40px", display: "flex", alignItems: "center" }}>
              {reporter || "ログイン情報を取得中です"}
            </Box>
          </Box> */}

          <Box sx={{ display: "flex", gap: 1 }}>
            <ButtonAction
              label={isSaving ? "作成中..." : "作成"}
              onClick={handleCreate}
              disabled={isSaving || !isValid}
            />
            <ButtonAction label="戻る" color="secondary" onClick={handleBack} disabled={isSaving} />
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default ContactCreatePage;
