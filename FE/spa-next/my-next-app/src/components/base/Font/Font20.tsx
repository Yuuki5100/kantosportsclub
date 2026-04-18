// components/base/font/Font20.tsx
import React from "react";
import Font from "./FontBase";
import type { SxProps, Theme, TypographyProps } from "@mui/material";

type Font20Props = TypographyProps & {
  bold?: boolean;
  sx?: SxProps<Theme>;
};

const Font20: React.FC<Font20Props> = ({ bold = true, sx = {}, ...rest }) => {
  return <Font size={20} bold={bold} sx={sx} {...rest} />;
};

export default Font20;
