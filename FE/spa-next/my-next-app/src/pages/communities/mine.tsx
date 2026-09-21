import React, { useEffect, useMemo, useState } from "react";
import { Box, Font14, Font20 } from "@/components/base";
import PageContainer from "@base/Layout/PageContainer";
import { useFetch } from "@/hooks/useApi";
import type { ApiResponse } from "@/types/api";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import CommunityPreviewCard from "@/components/functional/CommunityPreviewCard";
import { useRouter } from "next/router";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/api/apiClient";

type CommunityPreview = { url: string; title: string | null; description: string | null; image: string | null; siteName: string | null };
const previewCache = new Map<string, CommunityPreview | null>();

type CommunityItem = {
  id: number;
  title: string | null;
  url: string | null;
  note: string | null;
  label: string | null;
  author: string | null;
};

const MyCommunitiesPage: React.FC = () => {
  const router = useRouter();
  const { roleLevel } = useAuth();
  const { data, isLoading, isError } = useFetch<CommunityItem[] | ApiResponse<CommunityItem[]>>(
    "my-communities",
    API_ENDPOINTS.COMMUNITY.MINE,
  );
  const items = useMemo(() => Array.isArray(data) ? data : data?.data ?? [], [data]);
  const [previews, setPreviews] = useState<Record<string, CommunityPreview | null>>({});
  useEffect(() => {
    const urls = [...new Set(items.map((item) => item.url?.trim()).filter((url): url is string => Boolean(url)))];
    let cancelled = false;
    const load = async () => {
      const pending = urls.filter((url) => !previewCache.has(url));
      for (let index = 0; index < pending.length; index += 3) {
        await Promise.all(pending.slice(index, index + 3).map(async (url) => {
          try {
            const response = await apiClient.get<CommunityPreview>(API_ENDPOINTS.COMMUNITY.PREVIEW, { params: { url } });
            previewCache.set(url, response.data);
          } catch { previewCache.set(url, null); }
        }));
        if (!cancelled) setPreviews(Object.fromEntries(urls.map((url) => [url, previewCache.get(url) ?? null])));
      }
      if (!cancelled) setPreviews(Object.fromEntries(urls.map((url) => [url, previewCache.get(url) ?? null])));
    };
    void load();
    return () => { cancelled = true; };
  }, [items]);

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Font20>作成したコミュニティ</Font20>
          {(roleLevel ?? 0) >= 2 && <ButtonAction label="作成" size="small" sx={{ ml: "auto" }} onClick={() => void router.push("/communities/create")} />}
        </Box>
        <Box>
          <Font14>自分が作成したコミュニティを表示しています。</Font14>
        </Box>
        {isError ? <Box>データの取得に失敗しました。</Box> : (
          <>
            <Font14>{isLoading ? "読み込み中です。" : `${items.length} 件のデータを表示しています。`}</Font14>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {items.map((item) => item.url?.trim() ? (
                <CommunityPreviewCard key={item.id} title={item.title} note={item.note} label={item.label} author={item.author} url={item.url.trim()} preview={previews[item.url.trim()] ?? null} onClick={() => void router.push(`/communities/detail?id=${item.id}`)} />
              ) : null)}
            </Box>
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default MyCommunitiesPage;
