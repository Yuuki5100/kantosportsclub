export type PracticeMenuHeaderItem = {
  id: number;
  title: string | null;
  remarks: string | null;
  updater: string | null;
  created_at: string;
  updated_at: string;
};

export type PracticeMenuHeaderCreateInput = {
  title: string | null;
  remarks: string | null;
  updater: string | null;
  details: PracticeMenuDetailCreateInput[];
};

export type PracticeMenuDetailCreateInput = {
  category: string | null;
  menuName: string;
  menuTime: number | null;
  sortNo: number;
  updater: string | null;
};

export type PracticeMenuDetailItem = {
  id: number;
  headerId: number;
  category: string | null;
  menuName: string;
  menuTime: number | null;
  sortNo: number;
  updater: string | null;
  created_at: string;
  updated_at: string;
};

export type PracticeMenuHeaderWithDetailsItem = {
  id: number;
  title: string | null;
  remarks: string | null;
  updater: string | null;
  created_at: string;
  updated_at: string;
  details: PracticeMenuDetailItem[];
};

export type PracticeMenuHeaderUpdateInput = PracticeMenuHeaderCreateInput;
