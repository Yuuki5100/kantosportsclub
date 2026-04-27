import type { Bindings } from "../env";
import type { MediaItem, MediaRow } from "../types/media";

type MediaTable = "movies" | "pictures";

const mediaSelect = `
  SELECT
    id,
    title,
    description,
    url,
    location_id,
    created_at,
    updated_at
`;

const toMediaItem = (row: MediaRow): MediaItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  url: row.url,
  locationId: row.location_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const findAllMedia = async (
  db: Bindings["DB"],
  table: MediaTable
): Promise<MediaItem[]> => {
  const result = await db
    .prepare(`${mediaSelect} FROM ${table} ORDER BY id ASC`)
    .all<MediaRow>();

  return result.results.map(toMediaItem);
};
