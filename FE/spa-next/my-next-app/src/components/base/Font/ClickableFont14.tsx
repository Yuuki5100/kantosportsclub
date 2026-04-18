import React from "react";
import Font14 from "@base/Font/Font14";
import type { SxProps, Theme } from "@mui/material";

type ClickableFont14Props = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>; // ← ★ ここを追加
};

const ClickableFont14: React.FC<ClickableFont14Props> = ({
  children,
  onClick,
  className = "",
  style = {},
  sx = {},
}) => {
  return (
    <span onClick={onClick} style={{ cursor: "pointer" }}>
      <Font14 className={className} style={style} sx={sx}>
        {children}
      </Font14>
    </span>
  );
};

export default ClickableFont14;
