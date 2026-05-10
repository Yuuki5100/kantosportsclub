import type { MypageItem, MypageUpsertInput } from "../types/mypage";

type MypageRow = {
  user_id: number;
  user_name: string | null;
  enthusiasm: string | null;
  hope_style: string | null;
  remarks: string | null;
  image_url: string | null;
  create_at: string | null;
  update_at: string | null;
};

const toMypageItem = (row: MypageRow): MypageItem => ({
  userId: row.user_id,
  userName: row.user_name,
  enthusiasm: row.enthusiasm,
  hopeStyle: row.hope_style,
  remarks: row.remarks,
  imageUrl: row.image_url,
  createAt: row.create_at,
  updateAt: row.update_at,
});

const normalizeString = (value: unknown): string | null => {
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  return null;
};

export const findMypageByUserId = async (db: D1Database, userId: number): Promise<MypageItem | null> => {
  const row = await db
    .prepare(
      `
      SELECT
        user_id,
        user_name,
        enthusiasm,
        hope_style,
        remarks,
        image_url,
        create_at,
        update_at
      FROM mypage
      WHERE user_id = ?1
      LIMIT 1
      `
    )
    .bind(userId)
    .first<MypageRow>();

  return row ? toMypageItem(row) : null;
};

export const upsertMypage = async (
  db: D1Database,
  userId: number,
  input: MypageUpsertInput,
): Promise<MypageItem | null> => {
  const userName = normalizeString(input.userName);
  const enthusiasm = normalizeString(input.enthusiasm);
  const hopeStyle = normalizeString(input.hopeStyle);
  const remarks = normalizeString(input.remarks);
  const imageUrl = normalizeString(input.imageUrl);

  await db
    .prepare(
      `
      INSERT INTO mypage (
        user_id,
        user_name,
        enthusiasm,
        hope_style,
        remarks,
        image_url,
        create_at,
        update_at
      )
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        user_name = excluded.user_name,
        enthusiasm = excluded.enthusiasm,
        hope_style = excluded.hope_style,
        remarks = excluded.remarks,
        image_url = excluded.image_url,
        update_at = CURRENT_TIMESTAMP
      `
    )
    .bind(userId, userName, enthusiasm, hopeStyle, remarks, imageUrl)
    .run();

  return findMypageByUserId(db, userId);
};
