import React, { useEffect, useState } from "react";
import { TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import ButtonBack from "@/components/base/Button/ButtonBack";
import PageContainer from "@base/Layout/PageContainer";
import CommunityLabelSelector from "@/components/functional/CommunityLabelSelector";
import DeleteConfirmDialog from "@/components/functional/DeleteConfirmDialog";
import { apiService } from "@/api/apiService";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { useAuth } from "@/hooks/useAuth";
import { useSnackbar } from "@/hooks/useSnackbar";
import colors from "@/styles/colors";

type PracticeMovie = { id: number; title: string | null; url: string | null; note: string | null; label: string | null; author: string | null; createdAt: string | null; updatedAt: string | null };
type Form = { title: string; url: string; note: string; label: string };
const placeholders = { title: "例: ドリブル練習動画", url: "例: https://example.com", note: "補足を入力してください", label: "検索でヒットさせやすいワードを入力します" };

const PracticeMenuDetailPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, name } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [item, setItem] = useState<PracticeMovie | null>(null);
  const [form, setForm] = useState<Form>({ title: "", url: "", note: "", label: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    if (!router.isReady || !id) return;
    void apiService.get<PracticeMovie>(`${API_ENDPOINTS.PRACTICE_MOVIE.LIST}/${id}`).then((result) => {
      setItem(result);
      setForm({ title: result.title ?? "", url: result.url ?? "", note: result.note ?? "", label: result.label ?? "" });
    }).finally(() => setLoading(false));
  }, [router.isReady, router.query.id]);

  if (loading) return <PageContainer><Font14>読み込み中です。</Font14></PageContainer>;
  if (!item) return <PageContainer><Font14>練習メニューが見つかりません。</Font14></PageContainer>;

  const canManage = isAuthenticated === true && Boolean(name) && item.author === name?.trim();
  const update = async () => {
    if (!canManage) { showSnackbar("練習メニューの作成者のみ更新できます。", "ERROR"); return; }
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "入力必須です。";
    if (!form.url.trim()) next.url = "入力必須です。";
    if (!form.label.trim()) next.label = "入力必須です。";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    try {
      const updated = await apiService.put<PracticeMovie>(`${API_ENDPOINTS.PRACTICE_MOVIE.LIST}/${item.id}`, { ...form, note: form.note.trim() || null });
      setItem(updated);
      setForm({ title: updated.title ?? "", url: updated.url ?? "", note: updated.note ?? "", label: updated.label ?? "" });
      showSnackbar("練習メニューを更新しました。", "SUCCESS");
    } catch { showSnackbar("練習メニューの更新に失敗しました。", "ERROR"); }
  };
  const remove = async () => {
    if (!canManage) { showSnackbar("練習メニューの作成者のみ削除できます。", "ERROR"); return; }
    try {
      await apiService.delete(`${API_ENDPOINTS.PRACTICE_MOVIE.DELETE}/${item.id}`);
      showSnackbar("練習メニューを削除しました。", "SUCCESS");
      await router.push("/practiceMenu/mine");
    } catch { showSnackbar("練習メニューの削除に失敗しました。", "ERROR"); }
    finally { setDeleteOpen(false); }
  };
  const setField = (key: keyof Form, value: string) => { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); };
  const fields: Array<[string, keyof Form]> = [["タイトル", "title"], ["URL", "url"], ["補足", "note"], ["タグ", "label"]];

  return <PageContainer><Box sx={{ width: "min(100vw - 60px, 1200px)", maxWidth: "100%", mx: "auto", gap: 2 }}>
    <Box sx={{ gap: 0.5, mb: 2 }}><Font20>練習メニュー詳細</Font20><Font14 sx={{ color: colors.grayDark }}>練習メニューの登録内容を確認・編集します。</Font14></Box>
    <Box sx={{ border: `1.5px solid ${colors.commonBorderGray}`, borderRadius: 1, overflow: "hidden" }}>
      {fields.map(([label, key]) => <Box key={key} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" }, borderBottom: `1.5px solid ${colors.commonBorderGray}` }}><Box sx={{ p: 1.5, bgcolor: colors.commonTableHeader, fontWeight: 600 }}>{label}</Box><Box sx={{ p: 1.5 }}>{key === "label" ? <><Box sx={{ minHeight: 40, display: "flex", alignItems: "center", px: 1.5, py: 0.75, border: 1, borderColor: errors[key] ? "error.main" : "divider", borderRadius: 1, color: form[key] ? "text.primary" : "text.disabled", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{form[key] || placeholders[key]}</Box>{canManage && <CommunityLabelSelector value={form.label} onChange={(value) => setField("label", value)} />}</> : canManage ? <TextField fullWidth size="small" value={form[key]} placeholder={placeholders[key]} error={Boolean(errors[key])} helperText={errors[key]} multiline={key === "note"} minRows={key === "note" ? 3 : undefined} onChange={(event) => setField(key, event.target.value)} /> : <Typography sx={{ minHeight: 40, display: "flex", alignItems: "center", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{form[key] || "-"}</Typography>}</Box></Box>)}
    </Box>
    <Box sx={{ display: "flex", gap: 1.5 }}><ButtonBack onClick={() => void router.push("/practiceMenu/mine")} /><ButtonAction label="削除" color="secondary" onClick={() => setDeleteOpen(true)} disabled={!canManage} /><ButtonAction label="更新" onClick={() => void update()} disabled={!canManage} /></Box>
    <DeleteConfirmDialog open={deleteOpen} title="練習メニューを削除しますか？" onClose={() => setDeleteOpen(false)} onConfirm={remove} />
  </Box></PageContainer>;
};

export default PracticeMenuDetailPage;
