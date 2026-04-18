import React, { FC } from "react";
import { AccordionSummary, Box } from "@mui/material";
import Font20 from "@/components/base/Font/Font20";
import Font16 from "@/components/base/Font/Font16";
import colors from "@/styles/colors";

type CommonAccordionSummaryProps = {
  title: string;
  expanded: boolean;
  toggleExpanded: () => void;
};

export const CommonAccordionSummary: FC<CommonAccordionSummaryProps> = ({
  title,
  expanded,
  toggleExpanded,
}) => {
  const fontColor: string = colors.grayDark;

  return (
    <AccordionSummary
      sx={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent', // 背景を透過
        boxShadow: 'none',              // 影を削除
        border: 'none',                 // 枠線を削除（Accordion自体は枠線なしだが安全策）
      }}
    >
      {/* 横線＋中央タイトル＋回転アイコン */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
        {/* 左線 */}
        <Box sx={{ flexGrow: 1.05, height: 2, backgroundColor: '#696969' }} />

        {/* 中央タイトル */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: '1px solid' + fontColor,
            borderRadius: '40px',
            padding: '15px',
          }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-block",
              cursor: "pointer",
              transform: expanded ? "rotate(-180deg)" : "rotate(0deg)",
              transition: "transform 0.25s ease",
              userSelect: "none",
              fontSize: "20px",
            }}
            onClick={toggleExpanded}
          >
            <Font20 sx={{ color: fontColor }}>
              ▼
            </Font20>
          </Box>

          <Font16
            sx={{
              textAlign: 'center',
              width: '100%',
              backgroundColor: 'white',
              color: fontColor,
              marginRight: '35px',
              marginLeft: '35px',
            }}>{title}
          </Font16>

          <Box
            component="span"
            sx={{
              display: "inline-block",
              cursor: "pointer",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s ease",
              userSelect: "none",
              fontSize: "20px",
            }}
            onClick={toggleExpanded}
          >
            <Font20 sx={{ color: fontColor }}>
              ▼
            </Font20>
          </Box>
        </Box>

        {/* 右線 */}
        <Box sx={{ flexGrow: 1, height: 2, backgroundColor: '#696969' }} />
      </Box>
    </AccordionSummary>
  );
};
