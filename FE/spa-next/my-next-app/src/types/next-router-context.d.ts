// next-router-context.d.ts
declare module 'next/dist/shared/lib/router-context' {
    import { NextRouter } from 'next/router';
    import { Context } from 'react';
    export const RouterContext: Context<NextRouter>;
  }
  