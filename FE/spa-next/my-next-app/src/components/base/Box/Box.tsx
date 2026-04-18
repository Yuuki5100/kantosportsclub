import React from "react";
import { Box as MuiBox, BoxProps as MuiBoxProps } from "@mui/material";

export const Box: React.FC<MuiBoxProps> = ({ children, ...rest }) => {
  return (
    <MuiBox display="flex" flexDirection="column" alignItems="flex-start" {...rest}>
      {children}
    </MuiBox>
  );
};

export default Box;