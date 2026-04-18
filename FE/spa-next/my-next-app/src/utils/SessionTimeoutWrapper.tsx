'use client';
import React from 'react';
import { SessionTimeoutProvider } from '@/utils/SessionTimeoutProvider';

type Props = {
  children: React.ReactNode;
};

export const SessionTimeoutWrapper: React.FC<Props> = ({ children }) => {
  return <SessionTimeoutProvider>{children}</SessionTimeoutProvider>;
};
