import React, { useCallback, useEffect, useState } from "react";
import { Link, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { Box, Font14, Font20 } from "@/components/base";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { apiService } from "@/api/apiService";
import ButtonAction from "@/components/base/Button/ButtonAction";
import PageContainer from "@base/Layout/PageContainer";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";
import colors from "@/styles/colors";
import type { MediaItem } from "@/components/functional/MediaListPage";

type MovieDetail = {
  id: string;
  title: string;
  description: string;
  url: string;
  locationId: string;
  createdAt: string;
  updatedAt: string;
};

type DetailField = {
  label: string;
  value: string;
  link?: boolean;
};

type MovieUpdateRequest = {
  title: string;
  description: string;
};

const EMPTY_MOVIE: MovieDetail = {
  id: "",
  title: "",
  description: "",
  url: "",
  locationId: "",
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
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    setMovie({
      id: getQueryValue(router.query.id),
      title: getQueryValue(router.query.title),
      description: getQueryValue(router.query.description),
      url: getQueryValue(router.query.url),
      locationId: getQueryValue(router.query.locationId),
      createdAt: getQueryValue(router.query.createdAt),
      updatedAt: getQueryValue(router.query.updatedAt),
    });
  }, [router.isReady, router.query]);

  const handleTextChange = useCallback(
    (field: "title" | "description") => (event: React.ChangeEvent<HTMLInputElement>) => {
      setMovie((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    },
    []
  );

  const handleUpdate = useCallback(async () => {
    if (!movie.id) {
      showSnackbar(getMessage(MessageCodes.DATA_NOT_FOUND), "ERROR");
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await apiService.put<MediaItem>(
        `${API_ENDPOINTS.MOVIE.UPDATE}/${movie.id}`,
        {
          title: movie.title,
          description: movie.description,
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
  }, [movie.description, movie.id, movie.title, showSnackbar]);

  const handleBack = useCallback(
    () => router.push("/movies"),
    [router]
  );

  const fields: DetailField[] = [
    { label: "ID", value: movie.id },
    { label: "URL", value: movie.url, link: true },
    { label: "ロケーションID", value: movie.locationId },
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
