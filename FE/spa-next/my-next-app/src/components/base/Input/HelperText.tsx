import { FormHelperText } from '@mui/material';
import React from 'react';

type HelperTextProps = {
  helperText?: string;
  error?: boolean;
};
const HelperText: React.FC<HelperTextProps> = ({ helperText, error }) => {
  return (
    <FormHelperText error={error}>{helperText}</FormHelperText>
  );
};

export default HelperText;
