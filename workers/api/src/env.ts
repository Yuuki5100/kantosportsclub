export type Bindings = {
  kantosportsclub_db: D1Database;
  CORS_ORIGIN?: string;
  R2_PUBLIC_BASE_URL?: string;
};

export type AppVariables = {
  requestId: string;
};

export const getDb = (env: Bindings): D1Database => env.kantosportsclub_db;
