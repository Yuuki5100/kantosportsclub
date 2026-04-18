// components/base/font/Font16.tsx
import React from "react";
import Font from "./FontBase";
import type { SxProps, Theme, TypographyProps } from "@mui/material";

type Font16Props = TypographyProps & {
  bold?: boolean;
  sx?: SxProps<Theme>;
};

const Font16: React.FC<Font16Props> = ({ bold = true, sx = {}, ...rest }) => {
  return <Font size={16} bold={bold} sx={sx} {...rest} />;
};

export default Font16;
