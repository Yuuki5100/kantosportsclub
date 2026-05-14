export type MypageApiResponse = {
  userId: number;
  imageUrl?: string | null;
  userName: string | null;
  userNameJpn: string | null;
  jerseyNumber: number | null;
  enthusiasm: string | null;
  hopeStyle: string | null;
  remarks: string | null;
  createAt: string | null;
  updateAt: string | null;
};

export type MypageUpdateRequest = {
  imageUrl: string | null;
  userName: string | null;
  userNameJpn: string | null;
  jerseyNumber: number | null;
  enthusiasm: string | null;
  hopeStyle: string | null;
  remarks: string | null;
};
