// components/base/font/Font30.tsx
import React from "react";
import Font from "./FontBase";
import type { SxProps, Theme, TypographyProps } from "@mui/material";

type Font30Props = TypographyProps & {
  bold?: boolean;
  sx?: SxProps<Theme>;
};

const Font30: React.FC<Font30Props> = ({ bold = true, sx = {}, ...rest }) => {
  return <Font size={30} bold={bold} sx={sx} {...rest} />;
};

export default Font30;
