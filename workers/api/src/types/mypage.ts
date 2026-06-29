export type MypageItem = {
  userId: number;
  userName: string | null;
  userNameJpn: string | null;
  jerseyNumber: number | null;
  enthusiasm: string | null;
  hopeStyle: string | null;
  strengths: string | null;
  remarks: string | null;
  imageUrl: string | null;
  createAt: string | null;
  updateAt: string | null;
};

export type MypageUpsertInput = {
  userName: string | null;
  userNameJpn: string | null;
  jerseyNumber: number | null;
  enthusiasm: string | null;
  hopeStyle: string | null;
  strengths: string | null;
  remarks: string | null;
  imageUrl: string | null;
};
