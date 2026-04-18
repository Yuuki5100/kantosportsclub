import React from 'react';
import { Box, Font14 } from '@/components/base';
import ButtonAction from '@/components/base/Button/ButtonAction';

export type PaginationNumberButtonsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  range?: number;
};

const PaginationNumberButtons: React.FC<PaginationNumberButtonsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  range = 3,
}) => {
  const start = Math.max(1, currentPage - range);
  const end = Math.min(totalPages, currentPage + range);

  const buttons = [];

  if (start > 1) {
    buttons.push(
      <Font14 key="start-ellipsis" bold={false} sx={{ px: 1 }}>
        ...
      </Font14>
    );
  }

  for (let i = start; i <= end; i++) {
    buttons.push(
      <ButtonAction
        key={i}
        variant={i === currentPage ? 'contained' : 'outlined'}
        size="small"
        onClick={() => onPageChange(i)}
        label={`${i}`}
        sx={{ mx: 0.5, minWidth: '36px', px: 1 }}
      />
    );
  }

  if (end < totalPages) {
    buttons.push(
      <Font14 key="end-ellipsis" bold={false} sx={{ px: 1 }}>
        ...
      </Font14>
    );
  }

  return <Box display="flex" flexDirection="row" justifyContent="center">{buttons}</Box>;
};

export default PaginationNumberButtons;
