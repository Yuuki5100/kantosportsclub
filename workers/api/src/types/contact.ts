export type ContactItem = {
  id: string;
  type: string;
  status: string;
  display: string | null;
  sentence: string;
  reporter: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ContactCreateInput = {
  id: string;
  type: string;
  status: string;
  display: string | null;
  sentence: string;
  reporter: string;
};

export type ContactUpdateInput = {
  type: string | null;
  status: string | null;
  display: string | null;
  sentence: string | null;
  reporter: string | null;
};
