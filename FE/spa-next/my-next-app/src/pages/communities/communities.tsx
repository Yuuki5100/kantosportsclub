import React, { useEffect, useMemo, useState } from "react";
import { TextField } from "@mui/material";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import FormRow from "@/components/base/Input/FormRow";
import PageContainer from "@base/Layout/PageContainer";
import { useFetch } from "@/hooks/useApi";
import type { ApiResponse } from "@/types/api";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import apiClient from "@/api/apiClient";
import CommunityPreviewCard from "@/components/functional/CommunityPreviewCard";
import CommonAccordion from "@/components/base/utils/CommonAccordion";
import colors from "@/styles/colors";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";

type CommunityItem = {
  id: number;
  title: string | null;
  url: string | null;
  note: string | null;
  label: string | null;
  author: string | null;
};

type CommunityPreview = {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
};

const previewCache = new Map<string, CommunityPreview | null>();

type SearchCondition = { title: string; label: string };
const INITIAL_SEARCH: SearchCondition = { title: "", label: "" };
const extractItems = (data: CommunityItem[] | ApiResponse<CommunityItem[]> | null | undefined): CommunityItem[] =>
  Array.isArray(data) ? data : data?.data && Array.isArray(data.data) ? data.data : [];

const CommunitiesPage: React.FC = () => {
  const router = useRouter();
  const { roleLevel } = useAuth();
  const [search, setSearch] = useState(INITIAL_SEARCH);
  const [appliedSearch, setAppliedSearch] = useState(INITIAL_SEARCH);
  const params = useMemo(() => {
    const result: Record<string, string> = {};
    if (appliedSearch.title.trim()) result.title = appliedSearch.title.trim();
    if (appliedSearch.label.trim()) result.label = appliedSearch.label.trim();
    return Object.keys(result).length ? result : undefined;
  }, [appliedSearch]);
  const { data, isLoading, isError } = useFetch<CommunityItem[] | ApiResponse<CommunityItem[]>>(
    "communities", API_ENDPOINTS.COMMUNITY.LIST, params
  );
  const items = useMemo(() => extractItems(data), [data]);
  const [previews, setPreviews] = useState<Record<string, CommunityPreview | null>>({});

  useEffect(() => {
    const urls = [...new Set(items.map((item) => item.url?.trim()).filter((url): url is string => Boolean(url)))];
    let cancelled = false;
    const loadPreviews = async () => {
      const pending = urls.filter((url) => !previewCache.has(url));
      for (let index = 0; index < pending.length; index += 3) {
        await Promise.all(pending.slice(index, index + 3).map(async (url) => {
          try {
            const response = await apiClient.get<CommunityPreview>(API_ENDPOINTS.COMMUNITY.PREVIEW, { params: { url } });
            previewCache.set(url, response.data);
          } catch {
            previewCache.set(url, null);
          }
        }));
        if (!cancelled) {
          setPreviews(Object.fromEntries(urls.map((url) => [url, previewCache.get(url) ?? null])));
        }
      }
      if (!cancelled) {
        setPreviews(Object.fromEntries(urls.map((url) => [url, previewCache.get(url) ?? null])));
      }
    };
    void loadPreviews();
    return () => { cancelled = true; };
  }, [items]);

  const previewCards = items.map((item) => {
    const url = item.url?.trim();
    if (!url) return null;
    const preview = previews[url];
    return <CommunityPreviewCard key={`preview-${item.id}`} title={item.title} note={item.note} author={item.author} url={url} preview={preview ?? null} />;
  }).filter(Boolean);
  const searchElements = (
    <Box sx={{ p: 2, width: "100%" }}>
      <FormRow label="タイトル" labelAlignment="center" labelMinWidth="120px">
        <TextField fullWidth size="small" value={search.title} onChange={(e) => setSearch({ ...search, title: e.target.value })} />
      </FormRow>
      <FormRow label="ラベル" labelAlignment="center" labelMinWidth="120px">
        <TextField fullWidth size="small" value={search.label} onChange={(e) => setSearch({ ...search, label: e.target.value })} />
      </FormRow>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          width: "100%",
          alignItems: { xs: "stretch", sm: "center" },
          mt: 1,
        }}
      >
        <ButtonAction label="検索" onClick={() => setAppliedSearch(search)} />
        <ButtonAction label="クリア" color="secondary" onClick={() => { setSearch(INITIAL_SEARCH); setAppliedSearch(INITIAL_SEARCH); }} />
        <Font14 sx={{ color: colors.grayDark }}>
          {isLoading ? "読み込み中です。" : `${items.length} 件のデータを表示しています。`}
        </Font14>
      </Box>
    </Box>
  );
  return <PageContainer><Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Font20>コミュニティ</Font20>
      {(roleLevel ?? 0) >= 2 && <ButtonAction label="作成" size="small" sx={{ ml: "auto" }} onClick={() => void router.push("/communities/create")} />}
    </Box>
    {isError ? <Box>データの取得に失敗しました。</Box> : <>
      <CommonAccordion title="検索条件" defaultExpanded={false} sx={{ width: "100%" }}>{searchElements}</CommonAccordion>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>{previewCards}</Box>
    </>}
  </Box></PageContainer>;
};

export default CommunitiesPage;
