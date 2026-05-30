export type PlayerStatusItem = {
  id: number;
  userId: number;
  reviewUserId: number;
  shooting: number | null;
  dribbling: number | null;
  passing: number | null;
  defense: number | null;
  stamina: number | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerStatusCreateInput = {
  userId: number;
  reviewUserId: number;
  shooting: number | null;
  dribbling: number | null;
  passing: number | null;
  defense: number | null;
  stamina: number | null;
  remarks: string | null;
};

export type PlayerStatusUpdateInput = PlayerStatusCreateInput;
