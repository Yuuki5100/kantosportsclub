import React, { useMemo, useState } from "react";
import { Link, TextField } from "@mui/material";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import FormRow from "@/components/base/Input/FormRow";
import PageContainer from "@base/Layout/PageContainer";
import { ControllableListView } from "@/components/composite";
import type { TableState } from "@/components/composite/Listview/ControllableListView";
import type { ColumnDefinition, RowDefinition } from "@/components/composite/Listview/ListView";
import { useFetch } from "@/hooks/useApi";
import colors from "@/styles/colors";
import type { ApiResponse } from "@/types/api";

type MediaItem = {
  id: number;
  title: string | null;
  description: string | null;
  url: string | null;
  locationId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type MediaListPageProps = {
  title: string;
  endpoint: string;
  queryKey: string;
  enableTitleDescriptionSearch?: boolean;
};

type MediaSearchCondition = {
  title: string;
  description: string;
};

const INITIAL_SEARCH_CONDITION: MediaSearchCondition = {
  title: "",
  description: "",
};

const extractMediaItems = (
  response: MediaItem[] | ApiResponse<MediaItem[]> | null | undefined
): MediaItem[] => {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && Array.isArray(response.data)) {
    return response.data;
  }
  return [];
};

const columns: ColumnDefinition[] = [
  { id: "title", label: "タイトル", display: true, sortable: true, align: "left", widthPercent: 16 },
  { id: "description", label: "説明", display: true, sortable: true, align: "left", widthPercent: 24 },
  { id: "url", label: "URL", display: true, sortable: true, align: "left", widthPercent: 22 },
  { id: "locationId", label: "ロケーションID", display: true, sortable: true, align: "center", widthPercent: 10 },
  { id: "createdAt", label: "作成日時", display: true, sortable: true, align: "center", widthPercent: 10 },
];

const createCell = (
  columnId: string,
  rowId: number,
  value: string | number | boolean | undefined
) => ({
  id: `${columnId}-${rowId}`,
  columnId,
  cell: value ?? "-",
  value: value ?? "",
});

const toLinkHref = (url: string): string => {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url) || url.startsWith("/")) {
    return url;
  }
  return `https://${url}`;
};

const createUrlCell = (rowId: number, url: string | null | undefined) => {
  const value = url?.trim();
  const href = value ? toLinkHref(value) : "";

  return {
    id: `url-${rowId}`,
    columnId: "url",
    cell: value ? (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={value}
        onClick={(event) => event.stopPropagation()}
        sx={{
          display: "block",
          maxWidth: "100%",
          color: colors.primary,
          textDecoration: "underline",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          wordBreak: "break-all",
          "&:hover": {
            textDecoration: "none",
          },
        }}
      >
        {value}
      </Link>
    ) : "-",
    value: value ?? "",
  };
};

const MediaListPage: React.FC<MediaListPageProps> = ({
  title,
  endpoint,
  queryKey,
  enableTitleDescriptionSearch = false,
}) => {
  const [searchCondition, setSearchCondition] = useState<MediaSearchCondition>(INITIAL_SEARCH_CONDITION);
  const [appliedSearchCondition, setAppliedSearchCondition] = useState<MediaSearchCondition>(
    INITIAL_SEARCH_CONDITION
  );
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    rowsPerPage: 10,
    sortParams: {
      sortColumn: "id",
      sortOrder: "asc",
    },
  });

  const searchParams = useMemo(() => {
    const params: Record<string, string> = {};
    const titleValue = appliedSearchCondition.title.trim();
    const descriptionValue = appliedSearchCondition.description.trim();

    if (titleValue) {
      params.title = titleValue;
    }
    if (descriptionValue) {
      params.description = descriptionValue;
    }

    if (!enableTitleDescriptionSearch) {
      return undefined;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }, [appliedSearchCondition, enableTitleDescriptionSearch]);

  const { data, isLoading, isError, error } = useFetch<MediaItem[] | ApiResponse<MediaItem[]>>(
    queryKey,
    endpoint,
    searchParams
  );

  const mediaItems = useMemo(() => extractMediaItems(data), [data]);

  const rowData: RowDefinition[] = useMemo(
    () =>
      mediaItems.map((item) => ({
        cells: [
          createCell("title", item.id, item.title ?? undefined),
          createCell("description", item.id, item.description ?? undefined),
          createUrlCell(item.id, item.url),
          createCell("locationId", item.id, item.locationId ?? undefined),
          createCell("createdAt", item.id, item.createdAt ?? undefined),
        ],
      })),
    [mediaItems]
  );

  const handleSearch = () => {
    setTableState((current) => ({ ...current, page: 1 }));
    setAppliedSearchCondition(searchCondition);
  };

  const handleClear = () => {
    setSearchCondition(INITIAL_SEARCH_CONDITION);
    setAppliedSearchCondition(INITIAL_SEARCH_CONDITION);
    setTableState((current) => ({ ...current, page: 1 }));
  };

  const listInfoElements = (
    <Box sx={{ p: 2, color: colors.grayDark }}>
      {isLoading
        ? "読み込み中です。"
        : `${rowData.length} 件のデータを表示しています。`}
    </Box>
  );

  const searchElements = enableTitleDescriptionSearch ? (
    <Box
      sx={{ p: 2, width: "100%", gap: 1 }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <FormRow label="タイトル" labelAlignment="center" labelMinWidth="120px">
        <TextField
          name="pictureTitle"
          value={searchCondition.title}
          size="small"
          fullWidth
          onChange={(event) =>
            setSearchCondition((current) => ({ ...current, title: event.target.value }))
          }
        />
      </FormRow>

      <FormRow label="説明" labelAlignment="center" labelMinWidth="120px">
        <TextField
          name="pictureDescription"
          value={searchCondition.description}
          size="small"
          fullWidth
          onChange={(event) =>
            setSearchCondition((current) => ({ ...current, description: event.target.value }))
          }
        />
      </FormRow>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          width: "100%",
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <ButtonAction label="検索" onClick={handleSearch} />
        <ButtonAction label="クリア" color="secondary" onClick={handleClear} />
        <Font14 sx={{ color: colors.grayDark }}>
          {isLoading ? "読み込み中です。" : `${rowData.length} 件のデータを表示しています。`}
        </Font14>
      </Box>
    </Box>
  ) : listInfoElements;

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Font20>{title}</Font20>
          <Font14 sx={{ color: colors.grayDark, mt: 0.5 }}>
            API: {endpoint}
          </Font14>
        </Box>

        {isError ? (
          <Box sx={{ color: colors.Red }}>
            データの取得に失敗しました。{error?.message ? `(${error.message})` : ""}
          </Box>
        ) : (
          <>
            <ControllableListView
              page={tableState.page}
              sortParams={tableState.sortParams}
              rowsPerPage={tableState.rowsPerPage}
              onTableStateChange={setTableState}
              rowsPerPageOptions={[10, 20, 50]}
              topPaginationHidden={false}
              rowData={rowData}
              totalRowCount={rowData.length}
              columns={columns}
              searchOptions={{
                title: enableTitleDescriptionSearch ? "検索条件" : "一覧情報",
                elements: searchElements,
                accordionSx: { width: "100%" },
              }}
              sx={{
                width: "100%",
                "& .MuiTableHead-root .MuiTableCell-root": {
                  backgroundColor: colors.commonTableHeader,
                  color: colors.commonFontColorBlack,
                  fontWeight: 600,
                },
                "& .MuiTableBody-root .MuiTableCell-root": {
                  backgroundColor: colors.commonFontColorWhite,
                  color: colors.commonFontColorBlack,
                  borderBottom: `1.5px solid ${colors.commonBorderGray}`,
                },
                "& .MuiTableRow-root:hover .MuiTableCell-root": {
                  backgroundColor: colors.commonTableHover,
                },
              }}
            />
            {isLoading && (
              <Box sx={{ color: colors.grayDark }}>
                読み込み中...
              </Box>
            )}
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default MediaListPage;
