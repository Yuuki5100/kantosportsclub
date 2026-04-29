import React from 'react';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import ArrowDropUp from '@mui/icons-material/ArrowDropUp';
import { Box, Paper } from '@/components/base';
import type { SortDirection } from '@/components/base';
import colors from '@/styles/colors';
import { findCell } from '@/components/composite/Listview/findCell';
import type { RowDefinition } from '@/components/composite/Listview/ListView';
import type { ColumnWithComputedWidth } from '@/components/composite/Listview/utils/columnWidthUtils';
import type SortParams from '@/components/composite/Listview/SortParams';

type MobileListRowsProps = {
  columns: ColumnWithComputedWidth[];
  rowData: RowDefinition[];
  sortParams: SortParams;
  onSortChange: (params: SortParams) => void;
  onRowClick?: (row: RowDefinition, rowIndex: number) => void;
};

const getColumnSortKey = (column: ColumnWithComputedWidth): string => (
  column.sortKey ?? column.id.toString()
);

const isActiveSortColumn = (
  column: ColumnWithComputedWidth,
  sortColumn: string
): boolean => sortColumn === getColumnSortKey(column) || sortColumn === column.id.toString();

const EXCLUDED_SORT_COLUMN_IDS = ['url', 'description'];

const MobileListRows: React.FC<MobileListRowsProps> = ({
  columns,
  rowData,
  sortParams,
  onSortChange,
  onRowClick,
}) => {
  const visibleColumns = columns.filter((column) => column.display);
  const sortableColumns = visibleColumns.filter(
    (column) => column.sortable && column.id !== 'url' && column.id !== 'description'
  );

  const handleSortClick = (column: ColumnWithComputedWidth) => {
    if (!column.sortable) return;

    const active = isActiveSortColumn(column, sortParams.sortColumn);
    let nextSortOrder: SortDirection;

    if (!active || sortParams.sortOrder === false) {
      nextSortOrder = 'asc';
    } else if (sortParams.sortOrder === 'asc') {
      nextSortOrder = 'desc';
    } else {
      nextSortOrder = false;
    }

    onSortChange({
      sortColumn: nextSortOrder === false ? '' : getColumnSortKey(column),
      sortOrder: nextSortOrder,
    });
  };

  return (
    <Box sx={{ width: '100%', gap: 1.5 }}>
      {sortableColumns.length > 0 && (
        <Box sx={{ width: '100%', gap: 1 }}>
          <Box
            sx={{
              color: colors.grayDark,
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            並び替え
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              width: '100%',
              overflowX: 'auto',
              pb: 0.5,
            }}
          >
            {sortableColumns.map((column) => {
              const active = isActiveSortColumn(column, sortParams.sortColumn);
              const showAsc = active && sortParams.sortOrder === 'asc';
              const showDesc = active && sortParams.sortOrder === 'desc';

              return (
                <Box
                  key={column.id}
                  component="button"
                  onClick={() => handleSortClick(column)}
                  sx={{
                    display: 'inline-flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    gap: 0.25,
                    minHeight: 36,
                    maxWidth: 180,
                    px: 1.25,
                    border: `1px solid ${active ? colors.primary : colors.commonBorderGray}`,
                    borderRadius: 1,
                    bgcolor: active ? '#e3f2fd' : colors.commonFontColorWhite,
                    color: colors.commonFontColorBlack,
                    font: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {column.label}
                  </Box>
                  {showAsc && <ArrowDropUp fontSize="small" />}
                  {showDesc && <ArrowDropDown fontSize="small" />}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {rowData.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            width: '100%',
            p: 2,
            color: colors.grayDark,
            borderColor: colors.commonBorderGray,
          }}
        >
          データなし
        </Paper>
      ) : (
        <Box sx={{ width: '100%', gap: 1.5 }}>
          {rowData.map((row, rowIndex) => (
            <Paper
              key={row.cells.map((cell) => cell.id).join('-') || `mobile-row-${rowIndex}`}
              variant="outlined"
              data-testid="mobile-list-card"
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={() => onRowClick?.(row, rowIndex)}
              onKeyDown={(event) => {
                if (!onRowClick) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onRowClick(row, rowIndex);
                }
              }}
              sx={[
                {
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  p: 1.5,
                  borderColor: colors.commonBorderGray,
                  cursor: onRowClick ? 'pointer' : 'default',
                },
                ...(Array.isArray(row.rowSx) ? row.rowSx : row.rowSx ? [row.rowSx] : []),
              ]}
            >
              {visibleColumns.map((column, columnIndex) => {
                const cell = findCell(row.cells, column.id);

                return (
                  <Box
                    key={column.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(96px, 36%) minmax(0, 1fr)',
                      gap: 1,
                      width: '100%',
                      py: 1,
                      borderTop: columnIndex === 0 ? 'none' : `1px solid ${colors.commonBorderGray}`,
                    }}
                  >
                    <Box
                      sx={{
                        color: colors.grayDark,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        minWidth: 0,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {column.label}
                    </Box>
                    <Box
                      sx={{
                        color: colors.commonFontColorBlack,
                        minWidth: 0,
                        maxWidth: '100%',
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                      }}
                    >
                      {cell?.cell ?? '-'}
                    </Box>
                  </Box>
                );
              })}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MobileListRows;
