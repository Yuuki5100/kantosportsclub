import { createContext } from 'react';
import type { NextRouter } from 'next/router';

export const RouterContext = createContext({} as NextRouter);
