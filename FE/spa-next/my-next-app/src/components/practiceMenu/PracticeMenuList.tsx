import React, { useMemo } from "react";
import { Box, Font14, Font20, FlexBox } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { ControllableListView } from "@/components/composite";
import type { TableState } from "@/components/composite/Listview/ControllableListView";
import type { ColumnDefinition, RowDefinition } from "@/components/composite/Listview/ListView";
import colors from "@/styles/colors";

export type PracticeMenuHeader = {
  id: number;
  title: string | null;
  remarks: string | null;
  updater: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  headers: PracticeMenuHeader[];
  isLoading: boolean;
  isAuthenticated: boolean;
  roleLevel: number | null;
  tableState: TableState;
  onTableStateChange: React.Dispatch<React.SetStateAction<TableState>>;
  onCreate: () => void;
  onRowClick: (header: PracticeMenuHeader) => void;
};

const columns: ColumnDefinition[] = [
  { id: "title", label: "タイトル", display: true, sortable: true, align: "left", widthPercent: 26 },
  { id: "remarks", label: "備考", display: true, sortable: false, align: "left", widthPercent: 34 },
  { id: "updater", label: "更新者", display: true, sortable: true, align: "center", widthPercent: 12 },
  { id: "created_at", label: "作成日時", display: true, sortable: true, align: "center", widthPercent: 14 },
  { id: "updated_at", label: "更新日時", display: true, sortable: true, align: "center", widthPercent: 14 },
];

export const PracticeMenuList: React.FC<Props> = ({ headers, isLoading, isAuthenticated, roleLevel, tableState, onTableStateChange, onCreate, onRowClick }) => {
  const rowData: RowDefinition[] = useMemo(() => headers.map((header) => ({
    rowSx: { cursor: "pointer" },
    cells: [
      { id: `title-${header.id}`, columnId: "title", cell: header.title ?? "-", value: header.title ?? "" },
      { id: `remarks-${header.id}`, columnId: "remarks", cell: header.remarks ?? "-", value: header.remarks ?? "" },
      { id: `updater-${header.id}`, columnId: "updater", cell: header.updater ?? "-", value: header.updater ?? "" },
      { id: `created_at-${header.id}`, columnId: "created_at", cell: header.created_at ?? "-", value: header.created_at ?? "" },
      { id: `updated_at-${header.id}`, columnId: "updated_at", cell: header.updated_at ?? "-", value: header.updated_at ?? "" },
    ],
  })), [headers]);

  return (
    <Box sx={{ width: "min(100vw - 32px, 1152px)", maxWidth: "95%", py: 2 }}>
      <FlexBox justifyContent="space-between" width="100%" sx={{ mb: 2, gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Font20>練習メニュー一覧</Font20>
          <Font14 sx={{ color: colors.grayDark }}>practiceMenuHeader テーブルの一覧を表示しています。</Font14>
          <Font14 sx={{ color: colors.grayDark }}>{isLoading ? "読み込み中です。" : `${headers.length} 件`}</Font14>
        </Box>
        {isAuthenticated && (roleLevel ?? 0) >= 2 && (
          <ButtonAction label="新規作成" size="medium" onClick={onCreate} width={140} sx={{ backgroundColor: "commonTableHeader", color: "#ffffff", borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.2)", whiteSpace: "nowrap", "&:hover": { backgroundColor: "commonTableHeader" } }} />
        )}
      </FlexBox>
      <ControllableListView
        page={tableState.page}
        rowsPerPage={tableState.rowsPerPage}
        sortParams={tableState.sortParams}
        onTableStateChange={onTableStateChange}
        rowsPerPageOptions={[10, 20, 50]}
        rowData={rowData}
        totalRowCount={headers.length}
        columns={columns}
        showSearchOptions={false}
        topPaginationHidden
        bottomPaginationHidden
        onRowClick={(_, rowIndex) => { const header = headers[rowIndex]; if (header) onRowClick(header); }}
        sx={{ width: "100%", tableLayout: "fixed", "& table": { tableLayout: "fixed", width: "100%" }, "& .MuiTableCell-root": { whiteSpace: "normal !important", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.4, verticalAlign: "top" }, "& .MuiTableHead-root .MuiTableCell-root": { backgroundColor: colors.commonTableHeader, color: colors.commonFontColorBlack, fontWeight: 600 }, "& .MuiTableBody-root .MuiTableCell-root": { backgroundColor: colors.commonFontColorWhite, color: colors.commonFontColorBlack, borderBottom: `1.5px solid ${colors.commonBorderGray}` }, "& .MuiTableRow-root:hover .MuiTableCell-root": { backgroundColor: colors.commonTableHover } }}
      />
    </Box>
  );
};
