import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, TextField } from "@mui/material";
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

type MovieDetail = {
  id: string;
  title: string;
  description: string;
  url: string;
  locationId: number;
  locationName: string;
  createdAt: string;
  updatedAt: string;
};

type DetailField = {
  label: string;
  value: string;
  link?: boolean;
};

type MasterLocationItem = {
  locationId: number;
  locationName: string | null;
};

type LocationOption = {
  label: string;
  value: string;
};

type MovieUpdateRequest = {
  title: string;
  description: string;
  url: string;
  locationId: string | null;
};

const EMPTY_MOVIE: MovieDetail = {
  id: "",
  title: "",
  description: "",
  url: "",
  locationId: 0,
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

const toLinkHref = (url: string): string => {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url) || url.startsWith("/")) {
    return url;
  }
  return `https://${url}`;
};

const MovieDetailPage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [movie, setMovie] = useState<MovieDetail>(EMPTY_MOVIE);
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

    setMovie({
      id: getQueryValue(router.query.id),
      title: getQueryValue(router.query.title),
      description: getQueryValue(router.query.description),
      url: getQueryValue(router.query.url),
      locationId: Number(getQueryValue(router.query.locationId)) || 0,
      locationName: getQueryValue(router.query.locationName),
      createdAt: getQueryValue(router.query.createdAt),
      updatedAt: getQueryValue(router.query.updatedAt),
    });
    setSelectedLocationId("");
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (selectedLocationId || !movie.locationName) {
      return;
    }

    const currentLocation = locationOptions.find((option) => option.label === movie.locationName);
    if (currentLocation) {
      setSelectedLocationId(currentLocation.value);
    }
  }, [locationOptions, movie.locationName, selectedLocationId]);

  const handleTextChange = useCallback(
    (field: "title" | "description") => (event: React.ChangeEvent<HTMLInputElement>) => {
      setMovie((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    },
    []
  );

  const handleLocationChange = useCallback((option: LocationOption | null) => {
    setSelectedLocationId(option?.value ?? "");
    setMovie((current) => ({
      ...current,
      locationName: option?.label ?? "",
    }));
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!movie.id) {
      showSnackbar(getMessage(MessageCodes.DATA_NOT_FOUND), "ERROR");
      return;
    }

    setIsUpdating(true);
    try {
      const locationId =
        selectedLocationId ||
        locationOptions.find((option) => option.label === movie.locationName)?.value ||
        null;
      const updated = await apiService.put<MediaItem>(
        `${API_ENDPOINTS.MOVIE.UPDATE}/${movie.id}`,
        {
          title: movie.title,
          description: movie.description,
          url: movie.url,
          locationId: locationId ?? "",
        } satisfies MovieUpdateRequest
      );

      setMovie((current) => ({
        ...current,
        title: updated.title ?? "",
        description: updated.description ?? "",
        updatedAt: updated.updatedAt ?? current.updatedAt,
      }));
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "動画情報を更新"), "SUCCESS");
    } catch (error) {
      console.error("Update movie failed:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "動画情報の更新"), "ERROR");
    } finally {
      setIsUpdating(false);
    }
  }, [
    locationOptions,
    movie.description,
    movie.id,
    movie.locationName,
    movie.title,
    selectedLocationId,
    showSnackbar,
  ]);

  const handleBack = useCallback(
    () => router.push("/movies"),
    [router]
  );

  const fields: DetailField[] = [
    { label: "ID", value: movie.id },
    { label: "URL", value: movie.url, link: true },
    { label: "作成日時", value: movie.createdAt },
    { label: "更新日時", value: movie.updatedAt },
  ];

  return (
    <PageContainer>
      <Box sx={{ width: "100%", gap: 2 }}>
        <Box sx={{ width: "100%", gap: 0.5 }}>
          <Font20>動画詳細</Font20>
          <Font14 sx={{ color: colors.grayDark }}>一覧で選択した動画情報</Font14>
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
                name="movieTitle"
                value={movie.title}
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
                name="movieDescription"
                value={movie.description}
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
              場所
            </Box>
            <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
              <AutoComplete
                name="movieLocation"
                id="movieLocation"
                options={locationOptions}
                defaultValue={selectedLocationId || movie.locationName || undefined}
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
                  {field.link && field.value ? (
                    <Link
                      href={toLinkHref(field.value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: colors.primary,
                        overflowWrap: "anywhere",
                        wordBreak: "break-all",
                      }}
                    >
                      {field.value}
                    </Link>
                  ) : (
                    value
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ width: "100%", flexDirection: "row", gap: 1.5, alignItems: "center" }}>
          <ButtonAction label="戻る" color="secondary" onClick={handleBack} />
          <ButtonAction label="更新" onClick={handleUpdate} disabled={isUpdating || !movie.id} />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default MovieDetailPage;
