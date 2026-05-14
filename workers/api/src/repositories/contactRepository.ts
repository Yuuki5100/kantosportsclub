import type { ContactCreateInput, ContactItem, ContactUpdateInput } from "../types/contact";

type ContactRow = {
  id: string;
  type: string;
  status: string;
  display: string | null;
  sentence: string;
  reporter: string;
  created_at: string | null;
  updated_at: string | null;
};

const toContactItem = (row: ContactRow): ContactItem => ({
  id: row.id,
  type: row.type,
  status: row.status,
  display: row.display,
  sentence: row.sentence,
  reporter: row.reporter,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const isStringOrNull = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

export const findAllContacts = async (db: D1Database): Promise<ContactItem[]> => {
  const result = await db
    .prepare(
      `SELECT
         id,
         type,
         status,
         display,
         sentence,
         reporter,
         created_at,
         updated_at
       FROM contact
       ORDER BY created_at DESC, id DESC`
    )
    .all<ContactRow>();

  return result.results.map(toContactItem);
};

export const findContactById = async (
  db: D1Database,
  id: string
): Promise<ContactItem | null> => {
  const row = await db
    .prepare(
      `SELECT
         id,
         type,
         status,
         display,
         sentence,
         reporter,
         created_at,
         updated_at
       FROM contact
       WHERE id = ?1
       LIMIT 1`
    )
    .bind(id)
    .first<ContactRow>();

  return row ? toContactItem(row) : null;
};

export const createContact = async (
  db: D1Database,
  input: ContactCreateInput
): Promise<ContactItem | null> => {
  const schemaInfo = await db.prepare("PRAGMA table_info(contact)").all<{
    name: string;
    type: string | null;
    pk: number;
  }>();
  const idColumn = schemaInfo.results.find((row) => row.name === "id");
  const idType = idColumn?.type?.toUpperCase() ?? "";
  const isIntegerId = idType.includes("INT");

  const statement = isIntegerId
    ? db.prepare(
        `INSERT INTO contact (
           type,
           status,
           display,
           sentence,
           reporter,
           created_at,
           updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`
      )
    : db.prepare(
        `INSERT INTO contact (
           id,
           type,
           status,
           display,
           sentence,
           reporter,
           created_at,
           updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );

  const result = isIntegerId
    ? await statement
        .bind(
          input.type,
          input.status,
          input.display,
          input.sentence,
          input.reporter
        )
        .first<{ id: string | number }>()
    : await statement
        .bind(
          input.id,
          input.type,
          input.status,
          input.display,
          input.sentence,
          input.reporter
        )
        .run();

  if (!result) {
    return null;
  }

  const contactId = isIntegerId ? String(result.id) : input.id;
  return findContactById(db, contactId);
};

export const updateContact = async (
  db: D1Database,
  id: string,
  input: ContactUpdateInput
): Promise<ContactItem | null> => {
  const exists = await findContactById(db, id);
  if (!exists) {
    return null;
  }

  const type = isStringOrNull(input.type) ? input.type : null;
  const status = isStringOrNull(input.status) ? input.status : null;
  const display = isStringOrNull(input.display) ? input.display : null;
  const sentence = isStringOrNull(input.sentence) ? input.sentence : null;
  const reporter = isStringOrNull(input.reporter) ? input.reporter : null;

  await db
    .prepare(
      `UPDATE contact
       SET type = ?1,
           status = ?2,
           display = ?3,
           sentence = ?4,
           reporter = ?5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?6`
    )
    .bind(type, status, display, sentence, reporter, id)
    .run();

  return findContactById(db, id);
};
