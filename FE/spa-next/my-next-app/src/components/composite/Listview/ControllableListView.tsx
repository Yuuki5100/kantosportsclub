// components/composite/listview/ControllableListView.tsx
import React from 'react';
import { Box, Table, TableContainer } from '@/components/base';
import type { SelectChangeEvent, SxProps, Theme } from '@/components/base';
import ListViewPagination from './ListViewPagination';
import { TableHeaderRow } from '@/components/composite/Listview/TableHeaderRow';
import { SortableTableRows } from '@/components/composite/Listview/SortableTableRows';
import {
  RowDefinition,
  ColumnDefinition,
  SearchDefinition,
} from '@/components/composite/Listview/ListView';
import SortParams from '@/components/composite/Listview/SortParams';
import CommonAccordion from '@/components/base/utils/CommonAccordion';
import { computeColumnWidths } from '@composite/Listview/utils/columnWidthUtils';
import { ColumnWithComputedWidth } from '@composite/Listview/utils/columnWidthUtils';

type ListViewProps = {
  page: number;
  sortParams: SortParams;
  rowsPerPage: number;
  onTableStateChange?: (state: TableState) => void;
  rowsPerPageOptions?: number[];
  rowData: RowDefinition[];
  totalRowCount: number;
  columns: ColumnDefinition[];
  sx?: SxProps<Theme>;
  searchOptions?: SearchDefinition;
  topPaginationHidden?: boolean;
  bottomPaginationHidden?: boolean;
  onRowClick?: (row: RowDefinition, rowIndex: number) => void; // ← 追加
};

export type TableState = {
  page: number;
  rowsPerPage: number;
  sortParams: SortParams;
};

const ControllableListView: React.FC<ListViewProps> = (props) => {
  const {
    page,
    rowsPerPage,
    sortParams,
    onTableStateChange,
    rowData,
    totalRowCount,
    columns,
    sx,
    rowsPerPageOptions,
    searchOptions,
    topPaginationHidden,
    bottomPaginationHidden,
    onRowClick,
  } = props;

  const computedColumns: ColumnWithComputedWidth[] = computeColumnWidths(columns);

  const handleSortChange = (params: SortParams) => {
    onTableStateChange?.({
      page,
      rowsPerPage,
      sortParams: params,
    });
  };

  const handleChangePage = (newPage: number, params: SortParams) => {
    onTableStateChange?.({
      page: newPage,
      rowsPerPage,
      sortParams: params,
    });
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    onTableStateChange?.({
      page: 1,
      rowsPerPage: parseInt(event.target.value.toString(), 10),
      sortParams,
    });
  };

  return (
    <Box sx={sx}>
      {/* 検索条件アコーディオン */}
      <CommonAccordion
        title={searchOptions?.title ?? '検索条件'}
        sx={searchOptions?.accordionSx}
      >
        {searchOptions?.elements}
      </CommonAccordion>

      {/* ▲ ページネーション（上） */}
      <ListViewPagination
        count={totalRowCount ?? rowData?.length ?? 0}
        page={page}
        rowsPerPage={rowsPerPage}
        searchParams={sortParams}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        hidden={topPaginationHidden}
      />

      {/* テーブル表示 */}
      <TableContainer
        sx={{
          maxHeight: '400px',
          overflowY: 'auto',
          overflowX: 'auto',
        }}
      >
        <Table>
          <TableHeaderRow
            columns={computedColumns}
            sortParams={sortParams}
            handleSortChange={handleSortChange}
          />
          <SortableTableRows
            sortParams={sortParams}
            rowData={rowData}
            columnDefinition={computedColumns}
            page={page}
            rowsPerPage={rowsPerPage}
            onRowClick={onRowClick}
          />
        </Table>
      </TableContainer>

      {/* ▼ ページネーション（下） */}
      <ListViewPagination
        count={totalRowCount ?? rowData?.length ?? 0}
        page={page}
        rowsPerPage={rowsPerPage}
        searchParams={sortParams}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        hidden={bottomPaginationHidden}
      />
    </Box>
  );
};

export default ControllableListView;
