// components/base/font/Font24.tsx
import React from "react";
import Font from "./FontBase";
import type { SxProps, Theme, TypographyProps } from "@mui/material";

type Font24Props = TypographyProps & {
  bold?: boolean;
  sx?: SxProps<Theme>;
};

const Font24: React.FC<Font24Props> = ({ bold = true, sx = {}, ...rest }) => {
  return <Font size={24} bold={bold} sx={sx} {...rest} />;
};

export default Font24;
