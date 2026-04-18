// components/base/font/Font14.tsx
import React from "react";
import Font from "./FontBase";
import type { SxProps, Theme, TypographyProps } from "@mui/material";

type Font14Props = TypographyProps & {
  bold?: boolean;
  sx?: SxProps<Theme>;
};

const Font14: React.FC<Font14Props> = ({ bold = true, sx = {}, ...rest }) => {
  return <Font size={14} bold={bold} sx={sx} {...rest} />;
};

export default Font14;

