import React from 'react';
import { StackBox, Table, TableContainer } from '@/components/base';
import type { SxProps, Theme } from '@/components/base';
import { TableHeaderRow } from '@/components/composite/Listview/TableHeaderRow';
import { SortableTableRows } from '@/components/composite/Listview/SortableTableRows';
import {
  RowDefinition,
  ColumnDefinition,
  SearchDefinition,
} from '@/components/composite/Listview/ListView';
import SortParams from '@/components/composite/Listview/SortParams';
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
  itemPlaTypeMassageText?: string;
};

export type TableState = {
  page: number;
  rowsPerPage: number;
  sortParams: SortParams;
};

const EditableListView: React.FC<ListViewProps> = (props) => {
  const {
    page,
    rowsPerPage,
    sortParams,
    onTableStateChange,
    rowData,
    columns,
    sx,
    itemPlaTypeMassageText,
  } = props;

  const computedColumns: ColumnWithComputedWidth[] = computeColumnWidths(columns);

  const handleSortChange = (params: SortParams) => {
    onTableStateChange?.({
      page,
      rowsPerPage,
      sortParams: params,
    });
  };

  return (
    <StackBox sx={sx}>
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
          />
        </Table>
      </TableContainer>
      <label style={{ color: '#d32f2f', fontSize: 'smaller' }}>{itemPlaTypeMassageText}</label>
    </StackBox>
  );
};

export default EditableListView;
