'use client'
// src/pages/_app.tsx
import { AppProps, NextWebVitalsMetric } from 'next/app';
import Head from 'next/head';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from '@/store';
import BasePage from '@/components/composite/BasePage';
import ErrorBoundary from '@/components/functional/ErrorBoundary';
import ErrorNotification from '@/components/functional/ErrorNotification';
import SnackbarNotification from '@/components/functional/SnackbarNotification';
import { useAuthError } from '@/hooks/useAuthError';
import { useLanguage } from '@/hooks/useLanguage';
import { AuthInitializer } from '@/components/functional';
import ProtectedRoute from '@components/functional/ProtectedRoute';
import { isPublicPath, shouldSkipAuthCheck } from '@/config/AuthRouteConfig';
import { getPageConfig } from '@/config/PageConfig';
import { pageLang } from '@/config/PageLang';
import LoadingSpinner from '@/components/composite/LoadingSpinner';
import { headerLang } from '@/components/composite/Header/header.lang';

// import '@/assets/styles/globals.css';

import { initLogger } from "@/utils/logger";
import GlobalReportJobWatcher from '@/components/functional/GlobalReportJobWatcher';
import { resolvePageTitle } from '@/utils/pageTitle';

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/theme/theme'; // ★ 追加
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { SessionTimeoutWrapper } from '@/utils/SessionTimeoutWrapper';
import { reportWebVitalToOtel } from '@/utils/otelBrowser';

// クライアント側ログ初期化
if (typeof window !== "undefined") {
  initLogger();
}

// クエリクライアントは再生成されないように外部定義
const queryClient = new QueryClient();

// 認証エラーをグローバルに記録するフック
function AuthErrorHandler() {
  const { recordAuthError } = useAuthError();

  useEffect(() => {
    const logoutHandler = () => {
      recordAuthError();
    };

    window.addEventListener('logout', logoutHandler);
    return () => {
      window.removeEventListener('logout', logoutHandler);
    };
  }, [recordAuthError]);

  return null;
}

type AppContentProps = {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
};

function AppContent({ Component, pageProps }: AppContentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const headerLanguageRecord = useLanguage(headerLang);
  const pageLanguageRecord = useLanguage(pageLang);
  const publicPageTitleRecord = useLanguage({
    ja: {
      '/login': 'ログイン',
      '/callback': '認証コールバック',
      '/403': '403 Forbidden',
      '/404': '404 Not Found',
      '/_error': 'エラー',
      '/forgot-password': 'パスワード再設定',
      '/reset-password/[token]': '新しいパスワード設定',
    },
    en: {
      '/login': 'Login',
      '/callback': 'Authentication Callback',
      '/403': '403 Forbidden',
      '/404': '404 Not Found',
      '/_error': 'Error',
      '/forgot-password': 'Reset Password',
      '/reset-password/[token]': 'Set New Password',
    },
  });

  const pageTitle = useMemo(() => {
    return resolvePageTitle({
      pathname: router.pathname,
      appTitle: headerLanguageRecord.title,
      pageConfig: getPageConfig(),
      pageLabels: pageLanguageRecord,
      publicPageTitles: publicPageTitleRecord,
    });
  }, [router.pathname, headerLanguageRecord.title, pageLanguageRecord, publicPageTitleRecord]);

  const clearLoadingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // ページ遷移時のローディング表示（200ms以上かかる場合のみ表示）
  useEffect(() => {
    const handleStart = (url: string) => {
      // ログインページへの遷移やログインページからの遷移はスピナーを表示しない
      const isToPublicPath = isPublicPath(url);
      const isFromPublicPath = isPublicPath(router.pathname);

      if (isToPublicPath || isFromPublicPath) {
        return;
      }

      clearLoadingTimeout();
      timeoutRef.current = setTimeout(() => {
        setIsLoading(true);
      }, 200);
    };

    const handleComplete = () => {
      clearLoadingTimeout();
      setIsLoading(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      clearLoadingTimeout();
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // 初期マウント時とパス変更時にローディング状態をリセット
  useEffect(() => {
    clearLoadingTimeout();
    setIsLoading(false);
  }, [router.pathname]);

  const isCurrentPublicPath = isPublicPath(router.pathname);
  const shouldRunAuthInitializer = !shouldSkipAuthCheck(router.pathname);

  // useMemo にして pathname が変わったときに再評価
  const PageContent = useMemo(() => {
    // 公開ページは認証不要
    if (isCurrentPublicPath) {
      return <Component {...pageProps} />;
    }

    // それ以外のページも、ProtectedRoute 側で開発確認用に通過させる
    return (
      <ProtectedRoute>
        <Component {...pageProps} />
      </ProtectedRoute>
    );
  }, [Component, pageProps, isCurrentPublicPath]);

  // グローバルエラーハンドラ登録（console 出力）
  useEffect(() => {
    const handleError = (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ) => {
      console.error('Global Error:', { message, source, lineno, colno, error });
      return false;
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    };

    window.onerror = handleError;
    window.onunhandledrejection = handleRejection;

    return () => {
      window.onerror = null;
      window.onunhandledrejection = null;
    };
  }, []);

  // 公開ページはBasePageレイアウトを使用しない
  const renderContent = () => {
    if (isCurrentPublicPath) {
      return (
        <>
          {PageContent}
          <SnackbarNotification />
        </>
      );
    }

    return (
      <BasePage>
        <GlobalReportJobWatcher />
        {PageContent}
        <SnackbarNotification />
      </BasePage>
    );
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <AuthErrorHandler />
      {shouldRunAuthInitializer && <AuthInitializer />}
      <ErrorBoundary fallback={<ErrorNotification />}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LoadingSpinner open={isLoading} />
          {renderContent()}
        </ThemeProvider>
      </ErrorBoundary>
    </>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SessionTimeoutWrapper>
          <WebSocketProvider>
            <AppContent Component={Component} pageProps={pageProps} />
          </WebSocketProvider>
        </SessionTimeoutWrapper>
      </QueryClientProvider >
    </ReduxProvider >
  );
}

// export function reportWebVitals(metric: NextWebVitalsMetric) {
//   reportWebVitalToOtel(metric);
// }

export default MyApp;
