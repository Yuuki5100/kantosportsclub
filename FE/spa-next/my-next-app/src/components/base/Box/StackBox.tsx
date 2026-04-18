import React from "react";
import { Stack, StackProps } from "@mui/material";

export const StackBox: React.FC<StackProps> = ({
  children,
  direction = "column",
  spacing = 2,
  ...rest
}) => {
  return (
    <Stack direction={direction} spacing={spacing} {...rest}>
      {children}
    </Stack>
  );
};
export default StackBox;