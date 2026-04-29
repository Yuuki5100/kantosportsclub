import type { MasterLocationItem, MasterLocationRow } from "../types/masterLocation";

const toMasterLocationItem = (row: MasterLocationRow): MasterLocationItem => ({
  locationId: row.location_id,
  locationName: row.location_name
});

export const findAllMasterLocations = async (db: D1Database): Promise<MasterLocationItem[]> => {
  const result = await db
    .prepare(
      `SELECT location_id, location_name
       FROM master_locations
       ORDER BY location_id ASC`
    )
    .all<MasterLocationRow>();

  return result.results.map(toMasterLocationItem);
};
