import { findCell } from '@/components/composite/Listview/findCell';
import { RowDefinition } from '@/components/composite/Listview/ListView';
import { ColumnWithComputedWidth } from '@composite/Listview/utils/columnWidthUtils';
import SortParams from '@/components/composite/Listview/SortParams';
import { TableBody, TableCell, TableRow } from '@/components/base';
import type { SxProps, Theme } from '@/components/base';
import colors from '@/styles/colors';

export type SortableTableRowsProps = {
  sortParams: SortParams;
  rowData: RowDefinition[];
  columnDefinition: ColumnWithComputedWidth[];
  page: number;
  rowsPerPage: number;
  bodySx?: SxProps<Theme>;
  onRowClick?: (row: RowDefinition, rowIndex: number) => void; // ← 追加
};

export const SortableTableRows: React.FC<SortableTableRowsProps> = (props) => {
  const visibleColumns = props.columnDefinition.filter((column) => column.display);

  return (
    <TableBody sx={props.bodySx}>
      {props.rowData.map((row, rowIndex) => (
        <TableRow
          key={row.cells.map((cell) => cell.id).join('-') || `row-${rowIndex}`}
          sx={row.rowSx}
          hover={!!props.onRowClick} // カーソル変化用（クリック可能感）
          onClick={() => props.onRowClick?.(row, rowIndex)} // ← 追加
        >
          {visibleColumns.map((column) => (
            <TableCell
              key={column.id}
              align={column.align ?? 'center'}
              sx={{
                width: column.computedWidth,
                maxWidth: column.computedWidth,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                borderRight: `1.5px solid ${colors.commonBorderGray}`,
                borderBottom: `1.5px solid ${colors.commonBorderGray}`,
                '&:last-child': { borderRight: 'none' },
              }}
            >
              {findCell(row.cells, column.id)?.cell}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};
