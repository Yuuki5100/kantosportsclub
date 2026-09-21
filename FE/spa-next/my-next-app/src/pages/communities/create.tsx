import React, { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { TextField } from "@mui/material";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import ButtonBack from "@/components/base/Button/ButtonBack";
import PageContainer from "@base/Layout/PageContainer";
import colors from "@/styles/colors";
import { apiService } from "@/api/apiService";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import CommunityLabelSelector from "@/components/functional/CommunityLabelSelector";

type CommunityForm = { title: string; url: string; note: string; label: string };
const INITIAL_FORM: CommunityForm = { title: "", url: "", note: "", label: "" };
const fields: { key: keyof CommunityForm; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: "title", label: "タイトル", placeholder: "例: バスケの練習動画" },
  { key: "url", label: "URL", placeholder: "例: https://example.com" },
  { key: "note", label: "補足", placeholder: "補足を入力してください", multiline: true },
  { key: "label", label: "タグ", placeholder: "検索でヒットさせやすいワードを入力します", },
];

const CommunitiesCreatePage: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CommunityForm, string>>>({});
  const handleChange = useCallback((key: keyof CommunityForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }, []);
  const handleRegister = useCallback(() => {
    const nextErrors: Partial<Record<keyof CommunityForm, string>> = {};
    for (const key of ["title", "url", "label"] as const) {
      if (!form[key].trim()) nextErrors[key] = "入力必須です。";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      void apiService.post(API_ENDPOINTS.COMMUNITY.CREATE, {
        title: form.title.trim(),
        url: form.url.trim(),
        note: form.note.trim() || null,
        label: form.label.trim(),
      }).then(() => router.push("/communities"));
    }
  }, [form]);

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 60px, 1200px)", maxWidth: "100%", mx: "auto", gap: 2 }}>
        <Box sx={{ gap: 0.5, mb: 2 }}>
          <Font20>コミュニティ追加</Font20>
          <Font14 sx={{ color: colors.grayDark }}>コミュニティ情報を入力します。</Font14>
        </Box>
        <Box sx={{ border: `1.5px solid ${colors.commonBorderGray}`, borderRadius: 1, overflow: "hidden" }}>
          {fields.map((field) => (
            <Box key={field.key} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" }, borderBottom: `1.5px solid ${colors.commonBorderGray}` }}>
              <Box sx={{ p: 1.5, bgcolor: colors.commonTableHeader, fontWeight: 600 }}>{field.label}</Box>
              <Box sx={{ p: 1.5 }}>
                {field.key === "label" ? (
                  <Box sx={{ minHeight: 40, display: "flex", alignItems: "center", px: 1.5, py: 0.75, border: 1, borderColor: errors[field.key] ? "error.main" : "divider", borderRadius: 1, color: form.label ? "text.primary" : "text.disabled", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                    {form.label || field.placeholder}
                  </Box>
                ) : <TextField
                  fullWidth
                  size="small"
                  value={form[field.key]}
                  placeholder={field.placeholder}
                  required={field.key === "title" || field.key === "url"}
                  multiline={field.multiline}
                  minRows={field.multiline ? 3 : undefined}
                  error={Boolean(errors[field.key])}
                  helperText={errors[field.key]}
                  onChange={handleChange(field.key)}
                />}
                {field.key === "label" && (
                  <CommunityLabelSelector value={form.label} onChange={(label) => setForm((current) => ({ ...current, label }))} />
                )}
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <ButtonBack onClick={() => void router.push("/communities")} />
          <ButtonAction label="登録" onClick={handleRegister} />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default CommunitiesCreatePage;
