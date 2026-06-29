import React from "react";
import { Box as MuiBox, BoxProps as MuiBoxProps } from "@mui/material";

export const Box: React.FC<MuiBoxProps> = ({ children, ...rest }) => {
  return (
    <MuiBox {...rest}>
      {children}
    </MuiBox>
  );
};

export default Box;