import React, { useCallback, useMemo, useState } from "react";
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

export type MediaItem = {
  id: number;
  title: string | null;
  description: string | null;
  url: string | null;
  locationName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type MediaListPageProps = {
  title: string;
  endpoint: string;
  queryKey: string;
  enableTitleDescriptionSearch?: boolean;
  onItemClick?: (item: MediaItem) => void;
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
  { id: "createdAt", label: "開催日時", display: true, sortable: true, align: "center", widthPercent: 10 },
  { id: "locationName", label: "場所", display: true, sortable: true, align: "center", widthPercent: 10 },
  { id: "title", label: "タイトル", display: true, sortable: true, align: "left", widthPercent: 16 },
  { id: "description", label: "説明", display: true, sortable: true, align: "left", widthPercent: 24 },
  { id: "url", label: "URL", display: true, sortable: true, align: "left", widthPercent: 22 },
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
  sx: {
    whiteSpace: "normal",
    overflowWrap: "anywhere", // 推奨（モダン）
    wordBreak: "break-word",  // 保険
  }
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

const getMediaSortValue = (item: MediaItem, columnId: string): string | number => {
  const value = item[columnId as keyof MediaItem];

  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  return "";
};

const sortMediaItems = (items: MediaItem[], sortParams: TableState["sortParams"]): MediaItem[] => {
  const { sortColumn, sortOrder } = sortParams;
  if (!sortColumn || sortOrder === false) {
    return items;
  }

  return [...items].sort((a, b) => {
    const aValue = getMediaSortValue(a, sortColumn);
    const bValue = getMediaSortValue(b, sortColumn);
    const direction = sortOrder === "asc" ? 1 : -1;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * direction;
    }

    return String(aValue).localeCompare(String(bValue), "ja", { numeric: true }) * direction;
  });
};

const MediaListPage: React.FC<MediaListPageProps> = ({
  title,
  endpoint,
  queryKey,
  enableTitleDescriptionSearch = false,
  onItemClick,
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
  const sortedMediaItems = useMemo(
    () => sortMediaItems(mediaItems, tableState.sortParams),
    [mediaItems, tableState.sortParams]
  );
  const paginatedMediaItems = useMemo(() => {
    const startIndex = (tableState.page - 1) * tableState.rowsPerPage;
    return sortedMediaItems.slice(startIndex, startIndex + tableState.rowsPerPage);
  }, [sortedMediaItems, tableState.page, tableState.rowsPerPage]);

  const rowData: RowDefinition[] = useMemo(
    () =>
      paginatedMediaItems.map((item) => ({
        rowSx: onItemClick ? { cursor: "pointer" } : undefined,
        cells: [
          createCell("id", item.id, item.id),
          createCell("title", item.id, item.title ?? undefined),
          createCell("description", item.id, item.description ?? undefined),
          createUrlCell(item.id, item.url),
          createCell("locationName", item.id, item.locationName ?? undefined),
          createCell("createdAt", item.id, item.createdAt ?? undefined),
        ],
      })),
    [paginatedMediaItems, onItemClick]
  );

  const handleRowClick = useCallback(
    (row: RowDefinition) => {
      if (!onItemClick) return;

      const rowId = row.cells.find((cell) => cell.columnId === "id")?.value;
      const item = mediaItems.find((mediaItem) => mediaItem.id === Number(rowId));

      if (item) {
        onItemClick(item);
      }
    },
    [mediaItems, onItemClick]
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
        : `${mediaItems.length} 件のデータを表示しています。`}
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
          {isLoading ? "読み込み中です。" : `${mediaItems.length} 件のデータを表示しています。`}
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
              totalRowCount={mediaItems.length}
              columns={columns}
              onRowClick={onItemClick ? handleRowClick : undefined}
              searchOptions={{
                title: enableTitleDescriptionSearch ? "検索条件" : "一覧情報",
                elements: searchElements,
                accordionSx: { width: "100%" },
              }}
              sx={{
                width: "100%",
                tableLayout: "fixed",
                "& table": {
                  tableLayout: "fixed",
                  width: "100%",
                },
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
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
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
