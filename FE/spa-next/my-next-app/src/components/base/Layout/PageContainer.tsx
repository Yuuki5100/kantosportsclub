// components/layout/PageContainer.tsx
import { Box, BoxProps } from "@mui/material";

export const PageContainer: React.FC<BoxProps> = ({ children, ...rest }) => {
  return (
    <Box width="100%" pl={1.5} pr={1.5} py={1} {...rest}>
      {children}
    </Box>
  );
};

export default PageContainer;
