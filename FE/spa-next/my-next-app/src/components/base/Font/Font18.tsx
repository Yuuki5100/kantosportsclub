// components/base/font/Font18.tsx
import React from "react";
import Font from "./FontBase";
import type { SxProps, Theme, TypographyProps } from "@mui/material";

type Font18Props = TypographyProps & {
  bold?: boolean;
  sx?: SxProps<Theme>;
};

const Font18: React.FC<Font18Props> = ({ bold = true, sx = {}, ...rest }) => {
  return <Font size={18} bold={bold} sx={sx} {...rest} />;
};

export default Font18;
