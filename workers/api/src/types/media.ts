export type MediaItem = {
  id: number;
  title: string | null;
  description: string | null;
  url: string | null;
  locationName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type MediaSearchFilter = {
  title?: string;
  description?: string;
  url?: string;
};

export type MediaUpdateInput = {
  title: string | null;
  description: string | null;
  locationId: string | null;
  url?: string | null;
};

export type MediaCreateInput = {
  title: string;
  description: string;
  locationId: string | null;
  url: string;
};

export type MediaRow = {
  id: number;
  title: string | null;
  description: string | null;
  url: string | null;
  location_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};
