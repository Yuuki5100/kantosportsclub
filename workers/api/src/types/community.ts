export type CommunityItem = {
  id: number;
  title: string | null;
  url: string | null;
  note: string | null;
  label: string | null;
  author: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CommunitySearchFilter = {
  title?: string;
  label?: string;
  author?: string;
};

export type CommunityCreateInput = {
  title: string;
  url: string;
  note: string | null;
  label: string;
  author: string;
};

export type CommunityRow = {
  id: number;
  title: string | null;
  url: string | null;
  note: string | null;
  label: string | null;
  author: string | null;
  created_at: string | null;
  updated_at: string | null;
};
