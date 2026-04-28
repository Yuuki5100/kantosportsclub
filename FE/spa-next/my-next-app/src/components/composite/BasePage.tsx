import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Header, MobileHeader } from '@composite/Header';
import { Footer } from '@composite/Footer';
import { MobileSideMenu, SideMenu } from '@composite/SideMenu';
import ErrorNotification from '@functional/ErrorNotification';
import { PageContainer } from '@base/Layout/PageContainer';
import { Box } from '@/components/base';
import { SIDEBAR_COLLAPSED_WIDTH, HEADER_HEIGHT } from '@/components/config';
import { useLanguage } from '@/hooks/useLanguage';
import { HeaderLang, headerLang } from '@/components/composite/Header/header.lang';
import { footerLang, FooterLang } from '@/components/composite/Footer/footer.lang';
import { Breadcrumb } from '@/components/composite/Breadcrumb';
import { getPageConfig } from '@/config/PageConfig';
import { useAuth } from '@/hooks/useAuth';
import { pageLang } from '@/config/PageLang';
import { SnackbarListener } from '@/components/composite/SnackbarListener';
import { useTheme, useMediaQuery } from '@mui/material';
// import { useGlobalWebSocket } from '@/hooks/useGlobalWebSocket';

type BasePageProps = {
  children: ReactNode;
};

const BasePage = ({ children }: BasePageProps) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const router = useRouter();
  const { name } = useAuth();

  const headerLanguageRecord = useLanguage(headerLang);
  const headerLanguage: HeaderLang = {
    title: headerLanguageRecord['title'],
    defaultUserName: headerLanguageRecord['defaultUserName'],
    logoUrl: headerLanguageRecord['logoUrl'],
    logoHeight: headerLanguageRecord['logoHeight'],
    iconMarginRight: headerLanguageRecord['iconMarginRight']
  };

  const footerLanguageRecord = useLanguage(footerLang);
  const footerLanguage: FooterLang = {
    title: footerLanguageRecord['title'],
    description: footerLanguageRecord['description'],
    usernamePlaceholder: footerLanguageRecord['usernamePlaceholder'],
    passwordPlaceholder: footerLanguageRecord['passwordPlaceholder'],
    loginButton: footerLanguageRecord['loginButton'],
    loginError: footerLanguageRecord['loginError'],
    copyrightText: footerLanguageRecord['copyrightText'],
  };

  // --- 必要に応じてグローバル WebSocket もここで起動 ----------------
  // useGlobalWebSocket();  // ← まだ組み込んでいなければ追加
  // console.log('Websocketを起動しました。');
  //-------------------------------------------------------------------

  useEffect(() => {
    setMenuOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {isMobile ? (
        <MobileHeader
          onLogoClick={() => router.push('#')}
          onMenuClick={() => setMenuOpen(true)}
          language={headerLanguage}
          userName={name}
        />
      ) : (
        <Header onLogoClick={() => router.push('#')} language={headerLanguage} userName={name} />
      )}

      <Box sx={{ display: 'flex', flexGrow: 1 }} flexDirection="row">
        {isMobile ? (
          <MobileSideMenu open={menuOpen} setOpen={setMenuOpen} />
        ) : (
          <SideMenu open={menuOpen} setOpen={setMenuOpen} />
        )}

        <Box
          sx={{
            flexGrow: 1,
            pt: `${HEADER_HEIGHT}px`,
            ml: isMobile ? 0 : `${SIDEBAR_COLLAPSED_WIDTH}px`,
            transition: 'margin-left 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            minWidth: 0,
          }}
        >

          {/* パンくずリスト */}
          <Box sx={{}}>
            <Breadcrumb
              currentPath={router.pathname}
              pageConfigType={getPageConfig()}
              language={pageLang.ja}
              onLinkClick={(path: string) => router.push(path)}
            />
          </Box>

          <PageContainer>
            {children}
          </PageContainer>
        </Box>
      </Box>

      <ErrorNotification />
      <SnackbarListener />
      <Footer language={footerLanguage} />
    </Box>
  );
};


export default BasePage;
