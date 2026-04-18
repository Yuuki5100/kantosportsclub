import React from "react";
import { Box as MuiBox, BoxProps as MuiBoxProps } from "@mui/material";

export const FlexBox: React.FC<MuiBoxProps> = ({ children, ...rest }) => {
  return (
    <MuiBox display="flex" flexDirection="row" justifyContent="center" alignItems="center" {...rest}>
      {children}
    </MuiBox>
  );
};

export default FlexBox;