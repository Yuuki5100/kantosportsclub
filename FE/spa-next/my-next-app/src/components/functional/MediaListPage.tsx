import React, { useMemo, useState } from "react";
import { Box, Font14, Font20 } from "@/components/base";
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
  { id: "id", label: "ID", display: true, sortable: true, align: "center", widthPercent: 8 },
  { id: "title", label: "タイトル", display: true, sortable: true, align: "left", widthPercent: 16 },
  { id: "description", label: "説明", display: true, sortable: true, align: "left", widthPercent: 24 },
  { id: "url", label: "URL", display: true, sortable: true, align: "left", widthPercent: 22 },
  { id: "locationId", label: "ロケーションID", display: true, sortable: true, align: "center", widthPercent: 10 },
  { id: "createdAt", label: "作成日時", display: true, sortable: true, align: "center", widthPercent: 10 },
  { id: "updatedAt", label: "更新日時", display: true, sortable: true, align: "center", widthPercent: 10 },
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

const MediaListPage: React.FC<MediaListPageProps> = ({ title, endpoint, queryKey }) => {
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    rowsPerPage: 10,
    sortParams: {
      sortColumn: "id",
      sortOrder: "asc",
    },
  });

  const { data, isLoading, isError, error } = useFetch<MediaItem[] | ApiResponse<MediaItem[]>>(
    queryKey,
    endpoint
  );

  const mediaItems = useMemo(() => extractMediaItems(data), [data]);

  const rowData: RowDefinition[] = useMemo(
    () =>
      mediaItems.map((item) => ({
        cells: [
          createCell("id", item.id, item.id),
          createCell("title", item.id, item.title ?? undefined),
          createCell("description", item.id, item.description ?? undefined),
          createCell("url", item.id, item.url ?? undefined),
          createCell("locationId", item.id, item.locationId ?? undefined),
          createCell("createdAt", item.id, item.createdAt ?? undefined),
          createCell("updatedAt", item.id, item.updatedAt ?? undefined),
        ],
      })),
    [mediaItems]
  );

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
              rowData={rowData}
              totalRowCount={rowData.length}
              columns={columns}
              searchOptions={{
                title: "一覧情報",
                elements: (
                  <Box sx={{ p: 2, color: colors.grayDark }}>
                    {isLoading
                      ? "読み込み中です。"
                      : `${rowData.length} 件のデータを表示しています。`}
                  </Box>
                ),
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
