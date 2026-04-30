import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { TextField } from "@mui/material";
import { Box, Font14, Font20 } from "@/components/base";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { apiService } from "@/api/apiService";
import AutoComplete from "@/components/base/Input/AutoComplete";
import ButtonAction from "@/components/base/Button/ButtonAction";
import PageContainer from "@base/Layout/PageContainer";
import { useFetch } from "@/hooks/useApi";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";
import colors from "@/styles/colors";
import type { MediaItem } from "@/components/functional/MediaListPage";

type PictureCreateRequest = {
  title: string;
  description: string;
  url: string;
  locationId: string | null;
};

type PictureCreateState = {
  title: string;
  description: string;
  url: string;
};

type MasterLocationItem = {
  locationId: number;
  locationName: string | null;
};

type LocationOption = {
  label: string;
  value: string;
};

const INITIAL_STATE: PictureCreateState = {
  title: "",
  description: "",
  url: "",
};

const PictureCreatePage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState<PictureCreateState>(INITIAL_STATE);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const {
    data: masterLocations,
    isLoading: isMasterLocationsLoading,
    isError: isMasterLocationsError,
  } = useFetch<MasterLocationItem[]>(
    "masterLocations",
    API_ENDPOINTS.MASTER_LOCATION.LIST,
    undefined,
    { useCache: true }
  );

  const locationOptions: LocationOption[] = useMemo(
    () =>
      (masterLocations ?? []).map((location) => ({
        label: location.locationName ?? "",
        value: String(location.locationId),
      })),
    [masterLocations]
  );

  const handleChange = useCallback(
    (field: keyof PictureCreateState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const handleLocationChange = useCallback((option: LocationOption | null) => {
    setSelectedLocationId(option?.value ?? "");
  }, []);

  const handleBack = useCallback(() => {
    router.push("/admin/menu");
  }, [router]);

  const handleSave = useCallback(async () => {
    const title = form.title.trim();
    const description = form.description.trim();
    const url = form.url.trim();
    if (!title || !description || !url) {
      showSnackbar(getMessage(MessageCodes.ALL_FIELDS_REQUIRED), "ERROR");
      return;
    }

    setIsSaving(true);
    try {
      const created = await apiService.post<MediaItem>(API_ENDPOINTS.PICTURE.LIST, {
        title,
        description,
        url,
        locationId: selectedLocationId || null,
      } satisfies PictureCreateRequest);

      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "画像を追加"), "SUCCESS");
      router.push({
        pathname: "/pictures/detail",
        query: {
          id: String(created.id),
          title: created.title ?? "",
          description: created.description ?? "",
          url: created.url ?? "",
          locationId: selectedLocationId,
          locationName: created.locationName ?? "",
          createdAt: created.createdAt ?? "",
          updatedAt: created.updatedAt ?? "",
        },
      });
    } catch (error) {
      console.error("Create picture failed:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "画像の追加"), "ERROR");
    } finally {
      setIsSaving(false);
    }
  }, [form.description, form.title, form.url, router, selectedLocationId, showSnackbar]);

  return (
    <PageContainer>
      <Box sx={{ width: "100%", gap: 2 }}>
        <Box sx={{ width: "100%", gap: 0.5 }}>
          <Font20>画像追加</Font20>
          <Font14 sx={{ color: colors.grayDark }}>タイトル、説明、URLを入力して画像を登録します。</Font14>
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
              タイトル
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="pictureCreateTitle"
                value={form.title}
                size="small"
                fullWidth
                onChange={handleChange("title")}
              />
            </Box>
          </Box>

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
              説明
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="pictureCreateDescription"
                value={form.description}
                size="small"
                fullWidth
                multiline
                minRows={3}
                onChange={handleChange("description")}
              />
            </Box>
          </Box>

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
              URL
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <TextField
                name="pictureCreateUrl"
                value={form.url}
                size="small"
                fullWidth
                onChange={handleChange("url")}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
              width: "100%",
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
              場所
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <AutoComplete
                name="pictureCreateLocation"
                id="pictureCreateLocation"
                options={locationOptions}
                defaultValue={selectedLocationId || undefined}
                disabled={isMasterLocationsLoading || isMasterLocationsError}
                helperText={
                  isMasterLocationsError
                    ? "場所の取得に失敗しました。"
                    : isMasterLocationsLoading
                      ? "場所を読み込み中です。"
                      : undefined
                }
                error={isMasterLocationsError}
                onChange={handleLocationChange}
                customStyle={{ mt: 0 }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ width: "100%", flexDirection: "row", gap: 1.5, alignItems: "center" }}>
          <ButtonAction label="戻る" color="secondary" onClick={handleBack} />
          <ButtonAction label="登録" onClick={handleSave} disabled={isSaving} />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default PictureCreatePage;
