import React from "react";
import { Box } from "@/components/base";
import colors from "@/styles/colors";

export type KeyValueListItem = {
  key: string;
  label: string;
  value: React.ReactNode;
  rowSx?: Record<string, unknown>;
};

type KeyValueListProps = {
  items: KeyValueListItem[];
  maxWidth?: string;
};

const KeyValueList: React.FC<KeyValueListProps> = ({ items, maxWidth = "100%" }) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth,
        border: `1.5px solid ${colors.commonBorderGray}`,
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {items.map((item, index) => (
        <Box
          key={item.key}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
            width: "100%",
            borderBottom: index === items.length - 1 ? "none" : `1.5px solid ${colors.commonBorderGray}`,
            ...(item.rowSx ?? {}),
          }}
        >
          <Box
            sx={{
              p: 1.5,
              bgcolor: colors.commonTableHeader,
              color: colors.commonFontColorBlack,
              fontWeight: 600,
              lineHeight: 1.4,
              width: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {item.label}
          </Box>
          <Box
            sx={{
              p: 1.5,
              minWidth: 0,
              color: colors.commonFontColorBlack,
              lineHeight: 1.4,
              boxSizing: "border-box",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {item.value}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default KeyValueList;
