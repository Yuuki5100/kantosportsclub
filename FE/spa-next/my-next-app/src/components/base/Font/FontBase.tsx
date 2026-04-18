import React from 'react';
import { Typography } from '@mui/material';
import type { SxProps, Theme, TypographyProps } from '@mui/material';

type FontBaseProps = TypographyProps & {
  size?: number;
  bold?: boolean;
  sx?: SxProps<Theme>;
};

const Font: React.FC<FontBaseProps> = ({
  size = 16,
  bold = false,
  sx = {},
  ...rest
}) => {
  return (
    <Typography
      {...rest}
      sx={{
        fontSize: `${size}px`,
        fontWeight: bold ? 'bold' : 'normal',
        color: 'black',
        ...sx,
      }}
    >
      {rest.children}
    </Typography>
  );
};

export default Font;
