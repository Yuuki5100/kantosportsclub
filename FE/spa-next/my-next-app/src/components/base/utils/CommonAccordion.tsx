import React, { ReactNode, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  SxProps,
  Theme,
} from '@mui/material';
import { CommonAccordionSummary } from '@/components/base/utils/CommonAccordionSummary';

type CommonAccordionProps = {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  sx?: SxProps<Theme>;
};

const CommonAccordion = ({
  title,
  children,
  defaultExpanded = true,
  sx,
}: CommonAccordionProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // サマリー用の関数コンポーネント
  const CommonAccordionSummaryFooter: React.FC = () => {
    return (
      <CommonAccordionSummary
        title={title}
        expanded={expanded}
        toggleExpanded={() => setExpanded(prev => !prev)}
        // data-testid="search-filter"
      />
    );
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      sx={{
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'transparent', // 背景を透過
        boxShadow: 'none',              // 影を削除
        border: 'none',                 // 枠線を削除（Accordion自体は枠線なしだが安全策）
        ...sx,
      }}
    >

      <CommonAccordionSummary
        title={title}
        expanded={expanded}
        toggleExpanded={() => setExpanded(prev => !prev)}
        data-testid="search-content"
      />

      <AccordionDetails sx={{ backgroundColor: 'transparent' }}>
        {children}
      </AccordionDetails>

      <CommonAccordionSummaryFooter />
    </Accordion>
  );
};

export default CommonAccordion;
