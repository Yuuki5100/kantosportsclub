export type Bindings = {
  kantosportsclub_db: D1Database;
  CORS_ORIGIN?: string;
};

export type AppVariables = {
  requestId: string;
};

export const getDb = (env: Bindings): D1Database => env.kantosportsclub_db;
