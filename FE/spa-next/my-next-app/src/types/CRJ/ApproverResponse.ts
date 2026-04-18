export type ApproverListResponse = {
  approverList: ApproverInfo[];
};

export type ApproverInfo = {
  userId: string;
  userName: string;
};
