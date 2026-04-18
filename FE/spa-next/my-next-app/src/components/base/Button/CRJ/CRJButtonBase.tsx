import { ButtonBase } from '@/components/base/Button';
import { SxProps, Theme } from '@mui/material';
import React from 'react';
type CRJButtonBaseProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};
export const CRJButton = (props: CRJButtonBaseProps) => (
  <ButtonBase
    label={props.label}
    onClick={() => props.onClick?.()}
    disabled={props.disabled}
    sx={{...props.sx, marginRight: '4px', marginLeft: '4px', bgcolor: '#9e9e9e', '&:hover': { bgcolor: '#757575' } }}
  />
);
