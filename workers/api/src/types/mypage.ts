export type MypageItem = {
  userId: number;
  userName: string | null;
  enthusiasm: string | null;
  hopeStyle: string | null;
  remarks: string | null;
  imageUrl: string | null;
  createAt: string | null;
  updateAt: string | null;
};

export type MypageUpsertInput = {
  userName: string | null;
  enthusiasm: string | null;
  hopeStyle: string | null;
  remarks: string | null;
  imageUrl: string | null;
};
