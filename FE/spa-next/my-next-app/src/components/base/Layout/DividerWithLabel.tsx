// components/layout/DividerWithLabel.tsx
import { Divider, Typography, Box } from "@mui/material";

type Props = {
  label: string;
};

export const DividerWithLabel: React.FC<Props> = ({ label }) => {
  return (
    <Box display="flex" alignItems="center" my={2}>
      <Divider sx={{ flexGrow: 1 }} />
      <Typography variant="subtitle2" sx={{ px: 2, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
      <Divider sx={{ flexGrow: 1 }} />
    </Box>
  );
};

export default DividerWithLabel;