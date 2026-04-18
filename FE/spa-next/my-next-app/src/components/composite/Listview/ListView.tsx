import React, { ReactNode, useEffect, useState } from 'react';
import { Box, Table, TableContainer } from '@/components/base';
import type { SelectChangeEvent, SortDirection, SxProps, Theme } from '@/components/base';
import ListViewPagination from './ListViewPagination';
import { TableHeaderRow } from '@/components/composite/Listview/TableHeaderRow';
import { SortableTableRows } from '@/components/composite/Listview/SortableTableRows';
import CommonAccordion from '@/components/base/utils/CommonAccordion';
import { findCell } from '@/components/composite/Listview/findCell';
import colors from '@/styles/colors';
import SortParams from '@/components/composite/Listview/SortParams';
import { computeColumnWidths, ColumnWithComputedWidth } from '@composite/Listview/utils/columnWidthUtils';


/**
 * ListView コンポーネント用Props
 */
type ListViewProps = {
  /**
   * @description ページ変更時のコールバック関数
   * @param {number} page - 新しいページ番号
   * @param {SortParams} sortParams - 検索パラメータ
   * @returns {void}
   */
  onPageChange?: (page: number, sortParams: SortParams) => void;

  /**
   * @description ページサイズ変更時のコールバック関数
   * @param {number} pageSize - 新しいページサイズ
   * @returns {void}
   */
  onPageSizeChange?: (pageSize: number) => void;

  /**
   * @description ソート条件変更時のコールバック関数
   * @param {SortParams} params - ソートパラメータ
   * @returns {void}
   */
  onSort?: (params: SortParams) => void;

  rowData: RowDefinition[];
  columns: ColumnDefinition[];
  sx?: SxProps<Theme>;
  searchOptions?: SearchDefinition;

  /**
   * 上部のページネーションを非表示
   */
  topPaginationHidden?: boolean;

  /**
   * 下部のページネーションを非表示
   */
  bottomPaginationHidden?: boolean;

  /**
   * サーバーサイドページネーション用の総件数。
   * 指定時はクライアント側のスライスをスキップし、この値をページネーションの総件数として使用する。
   */
  totalRowCount?: number;
};

export type ColumnDefinition = {
  id: string | number;
  label: ReactNode;
  display: boolean;
  sortable: boolean;
  align?: 'left' | 'center' | 'right';
  sortKey?: string;
  widthPercent?: number; // ← ★ 追加：optional
};

export type CellDefinition = {
  id: string | number;
  /**
   * @description カラムID
   *
   * @type {(string | number)}
   */
  columnId: string | number;
  /**
   * @description セルの内容
   */
  cell: ReactNode | undefined;
  /**
   * @description ソート時に使用する値
   *
   * @type {(string | number | undefined)}
   */
  value: string | number | boolean | undefined;
};

export type RowDefinition = {
  cells: CellDefinition[];
  rowSx?: SxProps<Theme>;
};

export type SearchDefinition = {
  title?: string,
  elements: ReactNode,
  accordionSx?: SxProps<Theme>;
};

/**
 * ListView コンポーネント
 * テーブルを表示し、ページネーション、検索、ソート機能を提供するコンポーネント
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
const ListView: React.FC<ListViewProps> = (props) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [sortParams, setSortParams] = useState<SortParams>({
    sortColumn: '',
    sortOrder: false,
  });

  const [searchOptions, setSearchOptions] = useState<SearchDefinition>({
    title: '検索条件',
    elements: null, // デフォルトは null（空に）
    accordionSx: { width: '100%' }
  });

  /**
   * ソート条件変更時の処理
   *
   * @param {SortParams} params
   */
  const handleSortChange = (params: SortParams) => {
    setSortParams(params);
    props.onSort?.(params);
  };

  /**
   * ページ変更時の処理
   *
   * @param {number} newPage
   * @param {SortParams} params
   */
  const handleChangePage = (newPage: number, params: SortParams) => {
    setPage(newPage);
    // APIコールのためのページ番号
    // 必要に応じて0ベースのインデックスに変換する場合はここで変換
    props.onPageChange?.(newPage, params);
  };

  /**
   * ページサイズ変更時の処理
   *
   * @param {SelectChangeEvent<number>} event
   */
  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    const newRowsPerPage = parseInt(event.target.value.toString(), 10);
    setRowsPerPage(newRowsPerPage);
    // ページサイズ変更時は常に最初のページに戻す
    setPage(1);
    // 親コンポーネントにページサイズ変更を通知
    props.onPageSizeChange?.(newRowsPerPage);
    // 親コンポーネントに現在のページ（1ページ目）を通知
    props.onPageChange?.(1, sortParams);
  };

    // ソート処理
    const sortedRows: RowDefinition[] = sortRows(
      props.rowData,
      sortParams.sortColumn,
      sortParams.sortOrder
    );

    // ページネーション処理（totalRowCount指定時はサーバー側でページング済みのためスキップ）
    const paginatedRows = props.totalRowCount != null
      ? sortedRows
      : sortedRows.slice(
          (page - 1) * rowsPerPage,
          page * rowsPerPage
        );

    const displayCount = props.totalRowCount ?? props.rowData?.length ?? 0;

  useEffect(() => {
    if (props.searchOptions) {
      setSearchOptions(props.searchOptions);
    }
  }, [props.searchOptions]);

  const computedColumns: ColumnWithComputedWidth[] = computeColumnWidths(props.columns);


  return (
    <Box sx={props.sx}>
      {/* 検索条件アコーディオン */}
      <CommonAccordion
        title={searchOptions.title ?? '検索条件'}
        sx={searchOptions.accordionSx}
        >
        {/* 自由なコンテンツをここに挿入できる */}
        {searchOptions.elements}
      </CommonAccordion>

      {/* ▲ ページネーション（上） */}
      <ListViewPagination
        count={displayCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchParams={sortParams}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        hidden={props.topPaginationHidden}
      />

      <Box sx={{ mb: 2 }} />

      {/* テーブル全体（呼び出し元から渡される） */}
      <TableContainer
        sx={{
          maxHeight: '400px', // 必要に応じて親から override 可能
          overflowY: 'auto',
          overflowX: 'auto', // 横スクロールを有効化
          border: `1.5px solid ${colors.commonBorderGray}`,
        }}
      >
        <Table stickyHeader sx={{ width: '100%', tableLayout: 'fixed' }}>
          <TableHeaderRow
            columns={computedColumns}
            sortParams={sortParams}
            handleSortChange={handleSortChange}
          />
          <SortableTableRows
            sortParams={sortParams}
            rowData={paginatedRows}
            columnDefinition={computedColumns}
            page={page}
            rowsPerPage={rowsPerPage}
          />
        </Table>
      </TableContainer>

      {/* ▼ ページネーション（下） */}
      <ListViewPagination
        count={displayCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchParams={sortParams}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        hidden={props.bottomPaginationHidden}
      />
    </Box>
  );
};

const sortRows = (
  rows: RowDefinition[],
  columnId: string | number,
  order: SortDirection
): RowDefinition[] => {
  return [...rows].sort((a, b) => {
    const aValue = findCell(a.cells, columnId)?.value ?? 0;
    const bValue = findCell(b.cells, columnId)?.value ?? 0;

    if (order === 'asc') {
      if (aValue < bValue) {
        return -1;
      } else if (aValue > bValue) {
        return 1;
      }
    } else if (order === 'desc') {
      if (aValue > bValue) {
        return -1;
      } else if (aValue < bValue) {
        return 1;
      }
    }
    return 0;
  });
};

export default ListView;
