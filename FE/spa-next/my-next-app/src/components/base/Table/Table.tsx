import React from "react";
import MuiTable from "@mui/material/Table";
import type { TableProps } from "@mui/material/Table";
import colors from "@/styles/colors";

const DEFAULT_TABLE_SX = {
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
  "& .MuiTableBody-root .MuiTableRow-root:hover .MuiTableCell-root": {
    backgroundColor: colors.commonTableHover,
  },
} as const;

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ sx, ...rest }, ref) => {
  const mergedSx = Array.isArray(sx) ? [DEFAULT_TABLE_SX, ...sx] : [DEFAULT_TABLE_SX, sx];
  return <MuiTable ref={ref} sx={mergedSx} {...rest} />;
});

Table.displayName = "Table";

export default Table;
