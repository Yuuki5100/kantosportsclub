// components/layout/Section.tsx
import { Paper, PaperProps } from "@mui/material";

export const Section: React.FC<PaperProps> = ({ children, ...rest }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }} {...rest}>
      {children}
    </Paper>
  );
};
export default Section;
