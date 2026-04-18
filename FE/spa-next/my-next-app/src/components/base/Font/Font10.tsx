// components/base/font/Font10.tsx
import React from "react";
import Font from "./FontBase";
import type { SxProps, Theme, TypographyProps } from "@mui/material";

type Font10Props = TypographyProps & {
  bold?: boolean;
  sx?: SxProps<Theme>;
};

const Font10: React.FC<Font10Props> = ({ bold = true, sx = {}, ...rest }) => {
  return <Font size={10} bold={bold} sx={sx} {...rest} />;
};

export default Font10;
