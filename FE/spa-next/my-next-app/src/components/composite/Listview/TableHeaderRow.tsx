import { ColumnWithComputedWidth } from '@/components/composite/Listview/utils/columnWidthUtils';
import SortParams from '@/components/composite/Listview/SortParams';
import { Box, TableCell, TableHead, TableRow } from '@/components/base';
import type { SortDirection } from '@/components/base';
import colors from '@/styles/colors';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';

export type TableHeaderRowProps = {
  columns: ColumnWithComputedWidth[]; // ✅ 修正
  sortParams: SortParams;
  handleSortChange: (params: SortParams) => void;
};

export const TableHeaderRow: React.FC<TableHeaderRowProps> = (props) => {
  const decideDirection: (id: string | number) => 'asc' | 'desc' | undefined = (
    id: string | number
  ) => {
    if (props.sortParams.sortColumn !== id || props.sortParams.sortOrder === false) {
      return undefined;
    }
    return props.sortParams.sortOrder;
  };

  const renderSortIcons = (column: ColumnWithComputedWidth) => {
    const isActiveColumn = props.sortParams.sortColumn === column.id;
    const currentSort = props.sortParams.sortOrder;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
        <ArrowDropUp
          sx={{
            fontSize: 24,
            color: isActiveColumn && currentSort === 'asc' ? colors.commonFontColorBlack : 'action.disabled',
            lineHeight: 0.5
          }}
        />
        <ArrowDropDown
          sx={{
            fontSize: 24,
            color: isActiveColumn && currentSort === 'desc' ? colors.commonFontColorBlack : 'action.disabled',
            lineHeight: 0.5,
            mt: -0.5
          }}
        />
      </Box>
    );
  };

  const onClick = (column: ColumnWithComputedWidth) => {
    if (!column.sortable) return;

    let newSortOrder: SortDirection;
    if (props.sortParams.sortOrder === false || column.id !== props.sortParams.sortColumn) {
      newSortOrder = 'asc';
    } else if (props.sortParams.sortOrder === 'asc') {
      newSortOrder = 'desc';
    } else {
      newSortOrder = false;
    }

    props.handleSortChange({
      sortColumn: newSortOrder === false ? '' : (column.sortKey ?? column.id.toString()),
      sortOrder: newSortOrder,
    });
  };

  return (
    <TableHead>
      <TableRow>
        {props.columns
          .filter((column) => column.display)
          .map((column) => (
            <TableCell
              key={column.id}
              sortDirection={decideDirection(column.id)}
              onClick={() => onClick(column)}
              align="center"
              sx={{
                cursor: column.sortable ? 'pointer' : 'default',
                width: column.computedWidth,       // ✅ 幅指定
                maxWidth: column.computedWidth,    // ✅ 最大幅
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                borderRight: `1.5px solid ${colors.commonBorderGray}`,
                borderBottom: `1.5px solid ${colors.commonBorderGray}`,
                '&:last-child': { borderRight: 'none' },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {column.label}
                {renderSortIcons(column)}
              </Box>
            </TableCell>
          ))}
      </TableRow>
    </TableHead>
  );
};
