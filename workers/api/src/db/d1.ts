import type { Bindings } from "../env";

export const getSchemaVersion = async (db: Bindings["DB"]): Promise<string | null> => {
  try {
    const row = await db
      .prepare("SELECT value FROM app_metadata WHERE key = ?")
      .bind("schema_version")
      .first<{ value: string }>();

    return row?.value ?? null;
  } catch {
    return null;
  }
};

export const pingD1 = async (db: Bindings["DB"]): Promise<boolean> => {
  const row = await db.prepare("SELECT 1 AS ok").first<{ ok: number }>();
  return row?.ok === 1;
};
