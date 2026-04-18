// components/base/font/Font12.tsx
import React from "react";
import Font from "./FontBase";
import type { SxProps, Theme, TypographyProps } from "@mui/material";

type Font12Props = TypographyProps & {
  bold?: boolean;
  sx?: SxProps<Theme>;
};

const Font12: React.FC<Font12Props> = ({ bold = true, sx = {}, ...rest }) => {
  return <Font size={12} bold={bold} sx={sx} {...rest} />;
};

export default Font12;
