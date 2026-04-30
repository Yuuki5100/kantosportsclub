import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TextField } from "@mui/material";
import { useRouter } from "next/router";
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

type PictureDetail = {
  id: string;
  title: string;
  description: string;
  url: string;
  locationId: string;
  locationName: string;
  createdAt: string;
  updatedAt: string;
};

type DetailField = {
  label: string;
  value: string;
};

type MasterLocationItem = {
  locationId: number;
  locationName: string | null;
};

type LocationOption = {
  label: string;
  value: string;
};

type PictureUpdateRequest = {
  title: string;
  description: string;
  url: string;
  locationId: string | null;
};

const EMPTY_PICTURE: PictureDetail = {
  id: "",
  title: "",
  description: "",
  url: "",
  locationId: "",
  locationName: "",
  createdAt: "",
  updatedAt: "",
};

const getQueryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

const PictureDetailPage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [picture, setPicture] = useState<PictureDetail>(EMPTY_PICTURE);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
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

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const locationId = getQueryValue(router.query.locationId);

    setPicture({
      id: getQueryValue(router.query.id),
      title: getQueryValue(router.query.title),
      description: getQueryValue(router.query.description),
      url: getQueryValue(router.query.url),
      locationId,
      locationName: getQueryValue(router.query.locationName),
      createdAt: getQueryValue(router.query.createdAt),
      updatedAt: getQueryValue(router.query.updatedAt),
    });
    setSelectedLocationId(locationId);
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (selectedLocationId || !picture.locationName) {
      return;
    }

    const currentLocation = locationOptions.find((option) => option.label === picture.locationName);
    if (currentLocation) {
      setSelectedLocationId(currentLocation.value);
      setPicture((current) => ({
        ...current,
        locationId: currentLocation.value,
      }));
    }
  }, [locationOptions, picture.locationName, selectedLocationId]);

  const handleTextChange = useCallback(
    (field: "title" | "description" | "url") => (event: React.ChangeEvent<HTMLInputElement>) => {
      setPicture((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    },
    []
  );

  const handleLocationChange = useCallback((option: LocationOption | null) => {
    setSelectedLocationId(option?.value ?? "");
    setPicture((current) => ({
      ...current,
      locationId: option?.value ?? "",
      locationName: option?.label ?? "",
    }));
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!picture.id) {
      showSnackbar(getMessage(MessageCodes.DATA_NOT_FOUND), "ERROR");
      return;
    }

    setIsUpdating(true);
    try {
      const locationId =
        selectedLocationId ||
        picture.locationId ||
        locationOptions.find((option) => option.label === picture.locationName)?.value ||
        null;
      const updated = await apiService.put<MediaItem>(
        `${API_ENDPOINTS.PICTURE.LIST}/${picture.id}`,
        {
          title: picture.title,
          description: picture.description,
          url: picture.url,
          locationId,
        } satisfies PictureUpdateRequest
      );

      setPicture((current) => ({
        ...current,
        title: updated.title ?? "",
        description: updated.description ?? "",
        url: updated.url ?? "",
        locationId: locationId ?? "",
        locationName: updated.locationName ?? current.locationName,
        createdAt: updated.createdAt ?? current.createdAt,
        updatedAt: updated.updatedAt ?? current.updatedAt,
      }));
      setSelectedLocationId(locationId ?? "");
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "画像情報を更新"), "SUCCESS");
    } catch (error) {
      console.error("Update picture failed:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "画像情報の更新"), "ERROR");
    } finally {
      setIsUpdating(false);
    }
  }, [
    locationOptions,
    picture.description,
    picture.id,
    picture.locationId,
    picture.locationName,
    picture.title,
    picture.url,
    selectedLocationId,
    showSnackbar,
  ]);

  const handleBack = useCallback(
    () => router.push("/pictures"),
    [router]
  );

  const fields: DetailField[] = [
    { label: "ID", value: picture.id },
    { label: "作成日時", value: picture.createdAt },
    { label: "更新日時", value: picture.updatedAt },
  ];

  return (
    <PageContainer>
      <Box sx={{ width: "100%", gap: 2 }}>
        <Box sx={{ width: "100%", gap: 0.5 }}>
          <Font20>画像詳細</Font20>
          <Font14 sx={{ color: colors.grayDark }}>一覧で選択した画像情報</Font14>
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
                name="pictureTitle"
                value={picture.title}
                size="small"
                fullWidth
                onChange={handleTextChange("title")}
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
                name="pictureDescription"
                value={picture.description}
                size="small"
                fullWidth
                multiline
                minRows={3}
                onChange={handleTextChange("description")}
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
                name="pictureUrl"
                value={picture.url}
                size="small"
                fullWidth
                onChange={handleTextChange("url")}
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
              場所
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <AutoComplete
                name="pictureLocation"
                id="pictureLocation"
                options={locationOptions}
                defaultValue={selectedLocationId || picture.locationName || undefined}
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

          {fields.map((field) => {
            const value = field.value || "-";

            return (
              <Box
                key={field.label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
                  width: "100%",
                  borderBottom: `1.5px solid ${colors.commonBorderGray}`,
                  "&:last-child": {
                    borderBottom: "none",
                  },
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
                  {field.label}
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    minWidth: 0,
                    p: 1.5,
                    color: colors.commonFontColorBlack,
                    overflowWrap: "anywhere",
                  }}
                >
                  {value}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ width: "100%", flexDirection: "row", gap: 1.5, alignItems: "center" }}>
          <ButtonAction label="戻る" color="secondary" onClick={handleBack} />
          <ButtonAction label="更新" onClick={handleUpdate} disabled={isUpdating || !picture.id} />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default PictureDetailPage;
