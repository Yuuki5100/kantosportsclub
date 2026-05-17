import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import apiClient from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { Box, Font14, Font20, FlexBox } from "@/components/base";
import PageContainer from "@base/Layout/PageContainer";
import { ControllableListView } from "@/components/composite";
import type { TableState } from "@/components/composite/Listview/ControllableListView";
import type { ColumnDefinition, RowDefinition } from "@/components/composite/Listview/ListView";
import colors from "@/styles/colors";

type PracticeMenuHeader = {
  id: number;
  title: string | null;
  remarks: string | null;
  updater: string | null;
  created_at: string;
  updated_at: string;
};

const columns: ColumnDefinition[] = [
  { id: "title", label: "タイトル", display: true, sortable: true, align: "left", widthPercent: 26 },
  { id: "remarks", label: "備考", display: true, sortable: false, align: "left", widthPercent: 34 },
  { id: "updater", label: "更新者", display: true, sortable: true, align: "center", widthPercent: 12 },
  { id: "created_at", label: "作成日時", display: true, sortable: true, align: "center", widthPercent: 14 },
  { id: "updated_at", label: "更新日時", display: true, sortable: true, align: "center", widthPercent: 14 },
];

const getSortValue = (item: PracticeMenuHeader, columnId: string): string | number => {
  const value = item[columnId as keyof PracticeMenuHeader];
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }
  return "";
};

const sortPracticeMenuHeaders = (
  items: PracticeMenuHeader[],
  sortParams: TableState["sortParams"]
): PracticeMenuHeader[] => {
  const { sortColumn, sortOrder } = sortParams;
  if (!sortColumn || sortOrder === false) {
    return items;
  }

  const direction = sortOrder === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const aValue = getSortValue(a, sortColumn);
    const bValue = getSortValue(b, sortColumn);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * direction;
    }

    return String(aValue).localeCompare(String(bValue), "ja", { numeric: true }) * direction;
  });
};

const PracticeMenuListPage: React.FC = () => {
  const router = useRouter();
  const [headers, setHeaders] = useState<PracticeMenuHeader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    rowsPerPage: 10,
    sortParams: {
      sortColumn: "updated_at",
      sortOrder: "desc",
    },
  });

  const fetchPracticeMenuHeaders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<PracticeMenuHeader[]>(
        API_ENDPOINTS.PRACTICE_MENU.HEADER_LIST
      );
      setHeaders(response.data);
    } catch (error) {
      console.error("Failed to fetch practice menu headers:", error);
      setHeaders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPracticeMenuHeaders();
  }, [fetchPracticeMenuHeaders]);

  const sortedHeaders = useMemo(
    () => sortPracticeMenuHeaders(headers, tableState.sortParams),
    [headers, tableState.sortParams]
  );

  const paginatedHeaders = useMemo(() => {
    const startIndex = (tableState.page - 1) * tableState.rowsPerPage;
    return sortedHeaders.slice(startIndex, startIndex + tableState.rowsPerPage);
  }, [sortedHeaders, tableState.page, tableState.rowsPerPage]);

  const rowData: RowDefinition[] = useMemo(
    () =>
      paginatedHeaders.map((header) => ({
        rowSx: { cursor: "pointer" },
        cells: [
          {
            id: `title-${header.id}`,
            columnId: "title",
            cell: header.title ?? "-",
            value: header.title ?? "",
          },
          {
            id: `remarks-${header.id}`,
            columnId: "remarks",
            cell: header.remarks ?? "-",
            value: header.remarks ?? "",
          },
          {
            id: `updater-${header.id}`,
            columnId: "updater",
            cell: header.updater ?? "-",
            value: header.updater ?? "",
          },
          {
            id: `created_at-${header.id}`,
            columnId: "created_at",
            cell: header.created_at ?? "-",
            value: header.created_at ?? "",
          },
          {
            id: `updated_at-${header.id}`,
            columnId: "updated_at",
            cell: header.updated_at ?? "-",
            value: header.updated_at ?? "",
          },
        ],
      })),
    [paginatedHeaders]
  );

  const handleRowClick = useCallback(
    (header: PracticeMenuHeader) => {
      void router.push({
        pathname: "/practiceMenu/detail",
        query: {
          id: String(header.id),
          title: header.title ?? "",
          remarks: header.remarks ?? "",
          updater: header.updater ?? "",
          created_at: header.created_at ?? "",
          updated_at: header.updated_at ?? "",
        },
      });
    },
    [router]
  );

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 32px, 1152px)", maxWidth: "95%", py: 2 }}>
        <FlexBox justifyContent="space-between" width="100%" sx={{ mb: 2, gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Font20>練習メニュー一覧</Font20>
            <Font14 sx={{ color: colors.grayDark }}>
              practiceMenuHeader テーブルの一覧を表示しています。
            </Font14>
            <Font14 sx={{ color: colors.grayDark }}>
              {isLoading ? "読み込み中です。" : `${headers.length} 件`}
            </Font14>
          </Box>
          <ButtonAction
            label="新規作成"
            size="medium"
            onClick={() => void router.push("/practiceMenu/create")}
            width={140}
            sx={{
              backgroundColor: "commonTableHeader",
              color: "#ffffff",
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: "commonTableHeader",
              },
            }}
          />
        </FlexBox>

        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          onTableStateChange={setTableState}
          rowsPerPageOptions={[10, 20, 50]}
          rowData={rowData}
          totalRowCount={headers.length}
          columns={columns}
          showSearchOptions={false}
          topPaginationHidden
          bottomPaginationHidden
          onRowClick={(_, rowIndex) => {
            const header = paginatedHeaders[rowIndex];
            if (header) {
              handleRowClick(header);
            }
          }}
          sx={{
            width: "100%",
            tableLayout: "fixed",
            "& table": {
              tableLayout: "fixed",
              width: "100%",
            },
            "& .MuiTableCell-root": {
              whiteSpace: "normal !important",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              lineHeight: 1.4,
              verticalAlign: "top",
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
          }}
        />
      </Box>
    </PageContainer>
  );
};

export default PracticeMenuListPage;
