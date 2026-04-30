import React, { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/api/apiClient";
import { Box, Font14, Font20 } from "@/components/base";
import PageContainer from "@base/Layout/PageContainer";
import { ControllableListView } from "@/components/composite";
import type { TableState } from "@/components/composite/Listview/ControllableListView";
import type { ColumnDefinition, RowDefinition } from "@/components/composite/Listview/ListView";
import colors from "@/styles/colors";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";

type CurrentNoticeItem = {
  id: number;
  title: string | null;
  station: string | null;
  locationId: number | null;
  locationName: string | null;
  people: number | null;
  peopleName: string | null;
  remarks: string | null;
  publicAt: string | null;
  closedAt: string | null;
};

const columns: ColumnDefinition[] = [
  { id: "title", label: "タイトル", display: true, sortable: false, align: "left", widthPercent: 24 },
  { id: "station", label: "駅", display: true, sortable: false, align: "center", widthPercent: 10 },
  { id: "locationName", label: "場所", display: true, sortable: false, align: "center", widthPercent: 12 },
  { id: "people", label: "人数", display: true, sortable: false, align: "center", widthPercent: 8 },
  { id: "peopleName", label: "参加者", display: true, sortable: false, align: "left", widthPercent: 22 },
  { id: "publicAt", label: "公開日時", display: true, sortable: true, align: "center", widthPercent: 18 },
  { id: "closedAt", label: "終了日時", display: true, sortable: true, align: "center", widthPercent: 18 },
];

const getSortValue = (item: CurrentNoticeItem, columnId: string): string | number => {
  const value = item[columnId as keyof CurrentNoticeItem];
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }
  return "";
};

const sortNotices = (items: CurrentNoticeItem[], sortParams: TableState["sortParams"]): CurrentNoticeItem[] => {
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

const TopPageSimple: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [notices, setNotices] = useState<CurrentNoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    rowsPerPage: 10,
    sortParams: {
      sortColumn: "publicAt",
      sortOrder: "asc",
    },
  });

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<CurrentNoticeItem[]>("/api/notices/current");
      setNotices(response.data);
    } catch (error) {
      console.error("Failed to fetch current notices:", error);
      showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "お知らせ一覧"), "ERROR");
    } finally {
      setIsLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    void fetchNotices();
  }, [fetchNotices]);

  const sortedNotices = useMemo(
    () => sortNotices(notices, tableState.sortParams),
    [notices, tableState.sortParams]
  );

  const rowData: RowDefinition[] = useMemo(
    () =>
      sortedNotices.map((notice) => ({
        cells: [
          {
            id: `title-${notice.id}`,
            columnId: "title",
            cell: notice.title ?? "-",
            value: notice.title ?? "",
          },
          {
            id: `station-${notice.id}`,
            columnId: "station",
            cell: notice.station ?? "-",
            value: notice.station ?? "",
          },
          {
            id: `people-${notice.id}`,
            columnId: "people",
            cell: notice.people === null ? "-" : `${notice.people}人`,
            value: notice.people ?? "",
          },
          {
            id: `peopleName-${notice.id}`,
            columnId: "peopleName",
            cell: notice.peopleName ?? "-",
            value: notice.peopleName ?? "",
          },
          {
            id: `locationName-${notice.id}`,
            columnId: "locationName",
            cell: notice.locationName ?? "-",
            value: notice.locationName ?? "",
          },
          {
            id: `publicAt-${notice.id}`,
            columnId: "publicAt",
            cell: notice.publicAt ?? "-",
            value: notice.publicAt ?? "",
          },
          {
            id: `closedAt-${notice.id}`,
            columnId: "closedAt",
            cell: notice.closedAt ?? "-",
            value: notice.closedAt ?? "",
          },
        ],
      })),
    [sortedNotices]
  );

  const searchOptions = useMemo(
    () => ({
      title: "お知らせ",
      elements: (
        <Box sx={{ p: 2, color: colors.grayDark, lineHeight: 1.8 }}>
          <Font14 sx={{ color: colors.grayDark }}>
            現在公開中のお知らせを表示しています。
          </Font14>
        </Box>
      ),
      accordionSx: { width: "100%" },
    }),
    []
  );

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 32px, 1152px)", maxWidth: "95%", py: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
          <Font20>お知らせ一覧</Font20>
          <Font14 sx={{ color: colors.grayDark }}>
            公開中のお知らせを表示しています。
          </Font14>
          <Font14 sx={{ color: colors.grayDark }}>
            {isLoading ? "読み込み中です。" : `${notices.length} 件`}
          </Font14>
        </Box>

        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          onTableStateChange={setTableState}
          rowsPerPageOptions={[10, 20, 50]}
          rowData={rowData}
          totalRowCount={rowData.length}
          columns={columns}
          searchOptions={searchOptions}
          showSearchOptions={false}
          topPaginationHidden
          bottomPaginationHidden
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

export default TopPageSimple;
