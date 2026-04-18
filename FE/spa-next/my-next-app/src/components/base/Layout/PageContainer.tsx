// components/layout/PageContainer.tsx
import { Box, BoxProps } from "@mui/material";

export const PageContainer: React.FC<BoxProps> = ({ children, ...rest }) => {
  return (
    <Box width="100%" px={2} py={1} {...rest}>
      {children}
    </Box>
  );
};

export default PageContainer;
