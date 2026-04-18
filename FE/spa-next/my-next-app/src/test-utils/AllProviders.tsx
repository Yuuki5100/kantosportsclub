import React from 'react';
import { Provider } from 'react-redux';
import store from '../store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterContext } from '../test-utils/RouterContext';
import type { NextRouter } from 'next/router';

// ⚠️ Jest 環境下での使用前提：型に沿ったモック関数
const mockRouter: NextRouter = {
  route: '/protected',
  pathname: '/protected',
  query: {},
  asPath: '/protected',
  push: jest.fn(() => Promise.resolve(true)) as NextRouter['push'],
  replace: jest.fn(() => Promise.resolve(true)) as NextRouter['replace'],
  reload: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()) as NextRouter['prefetch'],
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  basePath: '',
  isReady: true,
  isFallback: false,
  defaultLocale: 'en',
  locale: 'en',
  isLocaleDomain: false,
  isPreview: false,
};

const queryClient = new QueryClient();

export const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <RouterContext.Provider value={mockRouter}>
        {children}
      </RouterContext.Provider>
    </QueryClientProvider>
  </Provider>
);
