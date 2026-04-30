type NoticeRow = {
  id: number;
  title: string | null;
  station: string | null;
  location_id: number | null;
  location_name: string | null;
  people: number | null;
  people_name: string | null;
  remarks: string | null;
  public_at: string | null;
  closed_at: string | null;
};

export type NoticeItem = {
  id: number;
  title: string | null;
  station: string | null;
  locationId: number | null;
  locationName: string | null;
  people: number | null;
  peopleName: string | null;
  remarks: string | null;
  publicAt: string | null;
  closedAt: string | null;
};

const toNoticeItem = (row: NoticeRow): NoticeItem => ({
  id: row.id,
  title: row.title,
  station: row.station,
  locationId: row.location_id,
  locationName: row.location_name,
  people: row.people,
  peopleName: row.people_name,
  remarks: row.remarks,
  publicAt: row.public_at,
  closedAt: row.closed_at
});

export const findNoticesByCurrentWindow = async (db: D1Database): Promise<NoticeItem[]> => {
  const result = await db
    .prepare(
      `SELECT
         id,
         title,
         station,
         n.location_id,
         ml.location_name AS location_name,
         people,
         people_name,
         remarks,
         public_at,
         closed_at
       FROM notices n
       LEFT JOIN master_locations ml ON ml.location_id = n.location_id
       WHERE public_at <= CURRENT_TIMESTAMP
         AND closed_at > CURRENT_TIMESTAMP
       ORDER BY n.public_at ASC, n.id ASC`
    )
    .all<NoticeRow>();

  return result.results.map(toNoticeItem);
};
