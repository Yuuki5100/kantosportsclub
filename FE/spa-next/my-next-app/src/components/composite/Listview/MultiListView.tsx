import React, { useEffect, useRef } from 'react';
import { Box, Table, TableContainer } from '@/components/base';
import type { SelectChangeEvent, SxProps, Theme } from '@/components/base';
import ListViewPagination from './ListViewPagination';
import { ColumnDefinition, SearchDefinition } from '@/components/composite/Listview/ListView';
import SortParams from '@/components/composite/Listview/SortParams';
import CommonAccordion from '@/components/base/utils/CommonAccordion';

/**
 * ListView コンポーネント用Props
 */
type ListViewProps = {
  /**
   * ページ
   */
  page: number;

  sortParams: SortParams;

  /**
   * ページサイズ
   */
  rowsPerPage: number;

  onTableStateChange?: (state: TableState) => void;

  rowsPerPageOptions?: number[];

  rowDataLength?: number;
  totalRowCount: number;
  columns?: ColumnDefinition[];
  sx?: SxProps<Theme>;
  searchOptions?: SearchDefinition;
  /**
   * 表示するコンポーネント
   */
  children?: React.ReactNode;
  childrenTop?: React.ReactNode;
  topPaginationHidden?: boolean;
  bottomPaginationHidden?: boolean;
};

export type TableState = {
  page: number;
  rowsPerPage: number;
  sortParams: SortParams;
};

/**
 * 呼び出し元でのコントロールに特化したListView コンポーネント
 * ListView同様、テーブルを表示し、ページネーション、検索、ソート機能を提供する
 *
 * @param {*} {
 *   onPageChange,
 *   onPageSizeChange,
 *   onSearch,
 *   onSort,
 *   searchColumns,
 *   sortColumns,
 *   children,
 * }
 * @return {*}
 */
const ControllableListView: React.FC<ListViewProps> = (props) => {
  const tableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollLeft = 0;
    }
  }, [props.sortParams]);

  /**
   * ページ変更時の処理
   *
   * @param {number} newPage
   * @param {SortParams} params
   */
  const handleChangePage = (newPage: number, params: SortParams) => {
    props.onTableStateChange?.({
      page: newPage,
      rowsPerPage: props.rowsPerPage,
      sortParams: params,
    });
  };

  /**
   * ページサイズ変更時の処理
   *
   * @param {SelectChangeEvent<number>} event
   */
  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    props.onTableStateChange?.({
      page: 1,
      rowsPerPage: parseInt(event.target.value.toString(), 10),
      sortParams: props.sortParams,
    });
  };

  return (
    <Box sx={props.sx}>
      {/* 検索条件アコーディオン */}
      <CommonAccordion
        title={props.searchOptions?.title ?? '検索条件'}
        sx={props.searchOptions?.accordionSx}
      >
        {/* 自由なコンテンツをここに挿入できる */}
        {props.searchOptions?.elements}
      </CommonAccordion>

      {/* ▲ ページネーション（上） */}
      <ListViewPagination
        count={props.totalRowCount ?? props.rowDataLength ?? 0}
        page={props.page}
        rowsPerPage={props.rowsPerPage}
        searchParams={props.sortParams}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={props.rowsPerPageOptions}
        hidden={props.topPaginationHidden}
      />
      {props.childrenTop}
      {/* テーブル全体（呼び出し元から渡される） */}
      <TableContainer
        ref={tableRef}
        sx={{
          maxHeight: '400px', // 必要に応じて親から override 可能
          overflowY: 'auto',
          overflowX: 'auto', // 横スクロールを有効化
        }}
      >
        <Table>{props.children}</Table>
      </TableContainer>

      {/* ▼ ページネーション（下） */}
      <ListViewPagination
        count={props.totalRowCount ?? props.rowDataLength ?? 0}
        page={props.page}
        rowsPerPage={props.rowsPerPage}
        searchParams={props.sortParams}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={props.rowsPerPageOptions}
        hidden={props.bottomPaginationHidden}
      />
    </Box>
  );
};

export default ControllableListView;
