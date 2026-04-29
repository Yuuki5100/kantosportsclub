export const getSchemaVersion = async (db: D1Database): Promise<string | null> => {
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

export const pingD1 = async (db: D1Database): Promise<boolean> => {
  const row = await db.prepare("SELECT 1 AS ok").first<{ ok: number }>();
  return row?.ok === 1;
};
