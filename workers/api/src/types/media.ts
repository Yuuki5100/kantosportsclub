export type MediaItem = {
  id: number;
  title: string | null;
  description: string | null;
  url: string | null;
  locationName: string | null;
  locationImageUrl1: string | null;
  locationImageUrl2: string | null;
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
  url?: string | null;
  locationId: string | null;
};

export type MediaCreateInput = {
  title: string;
  description: string;
  url: string;
  locationId: string | null;
};

export type MediaRow = {
  id: number;
  title: string | null;
  description: string | null;
  url: string | null;
  location_name: string | null;
  location_image_url1: string | null;
  location_image_url2: string | null;
  created_at: string | null;
  updated_at: string | null;
};
