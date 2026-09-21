import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TextField } from "@mui/material";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import PageContainer from "@base/Layout/PageContainer";
import { apiService } from "@/api/apiService";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import colors from "@/styles/colors";
import CommunityLabelSelector from "@/components/functional/CommunityLabelSelector";
import { useAuth } from "@/hooks/useAuth";
import { useSnackbar } from "@/hooks/useSnackbar";

type Community = { id: number; title: string | null; url: string | null; note: string | null; label: string | null; author: string | null; createdAt: string | null; updatedAt: string | null };
const COMMUNITY_PLACEHOLDERS: Record<string, string> = {
  タイトル: "例: バスケの練習動画",
  URL: "例: https://example.com",
  補足: "補足を入力してください",
  ラベル: "検索でヒットさせやすいワードを入力します",
};
const CommunityDetailPage: React.FC = () => {
  const router = useRouter();
  const { roleLevel } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [community, setCommunity] = useState<Community | null>(null);
  const [label, setLabel] = useState("");
  const [form, setForm] = useState({ title: "", url: "", note: "", label: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    if (!router.isReady || !id) return;
    void apiService.get<Community>(`${API_ENDPOINTS.COMMUNITY.LIST}/${id}`).then((result) => { setCommunity(result); setLabel(result.label ?? ""); setForm({ title: result.title ?? "", url: result.url ?? "", note: result.note ?? "", label: result.label ?? "" }); }).finally(() => setLoading(false));
  }, [router.isReady, router.query.id]);
  if (loading) return <PageContainer><Font14>読み込み中です。</Font14></PageContainer>;
  if (!community) return <PageContainer><Font14>コミュニティが見つかりません。</Font14></PageContainer>;
  const fields = [
    ["タイトル", form.title], ["URL", form.url], ["補足", form.note], ["ラベル", form.label],
  ];
  const handleUpdate = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "入力必須です。";
    if (!form.url.trim()) nextErrors.url = "入力必須です。";
    if (!form.label.trim()) nextErrors.label = "入力必須です。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !community?.id) return;
    try {
      const updated = await apiService.put<Community>(`${API_ENDPOINTS.COMMUNITY.LIST}/${community.id}`, { ...form, note: form.note.trim() || null });
      setCommunity(updated);
      setForm({ title: updated.title ?? "", url: updated.url ?? "", note: updated.note ?? "", label: updated.label ?? "" });
      showSnackbar("コミュニティを更新しました。", "SUCCESS");
    } catch {
      showSnackbar("コミュニティの更新に失敗しました。", "ERROR");
    }
  };
  return <PageContainer><Box sx={{ width: "min(100vw - 60px, 1200px)", maxWidth: "100%", mx: "auto", gap: 2 }}>
    <Box sx={{ gap: 0.5, mb: 2 }}><Font20>コミュニティ詳細</Font20><Font14 sx={{ color: colors.grayDark }}>コミュニティの登録内容を確認・編集します。</Font14></Box>
    <Box sx={{ border: `1.5px solid ${colors.commonBorderGray}`, borderRadius: 1, overflow: "hidden" }}>
      {fields.map(([fieldLabel, value]) => { const key = fieldLabel === "タイトル" ? "title" : fieldLabel === "URL" ? "url" : fieldLabel === "補足" ? "note" : "label"; return <Box key={fieldLabel} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" }, borderBottom: `1.5px solid ${colors.commonBorderGray}` }}><Box sx={{ p: 1.5, bgcolor: colors.commonTableHeader, fontWeight: 600 }}>{fieldLabel}</Box><Box sx={{ p: 1.5 }}><TextField fullWidth size="small" value={value} placeholder={COMMUNITY_PLACEHOLDERS[fieldLabel]} error={Boolean(errors[key])} helperText={errors[key]} multiline={fieldLabel === "ラベル" || fieldLabel === "補足"} minRows={fieldLabel === "ラベル" ? 2 : fieldLabel === "補足" ? 3 : undefined} onChange={(event) => { const next = event.target.value; setForm((current) => ({ ...current, [key]: next })); setErrors((current) => ({ ...current, [key]: "" })); }} />{fieldLabel === "ラベル" && <CommunityLabelSelector value={value} onChange={(next) => { setLabel(next); setForm((current) => ({ ...current, label: next })); setErrors((current) => ({ ...current, label: "" })); }} />}</Box></Box>; })}
    </Box>
    <Box sx={{ display: "flex", gap: 1.5 }}><ButtonAction label="戻る" color="secondary" onClick={() => void router.push("/communities/mine")} /><ButtonAction label="更新" onClick={handleUpdate} disabled={(roleLevel ?? 0) < 2} /></Box>
  </Box></PageContainer>;
};
export default CommunityDetailPage;
