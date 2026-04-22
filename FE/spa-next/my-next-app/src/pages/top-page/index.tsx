import React from "react";
import { Box, Font20 } from "@/components/base";
import PageContainer from "@base/Layout/PageContainer";

const TopPageSimple: React.FC = () => {
  return (
    <PageContainer>
      <Box sx={{ py: 2 }}>
        <Font20>トップページです。</Font20>
      </Box>
    </PageContainer>
  );
};

export default TopPageSimple;
