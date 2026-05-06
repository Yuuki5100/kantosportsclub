export type NoticeItem = {
  id: number;
  title: string | null;
  station: string | null;
  locationId: number | null;
  locationName: string | null;
  people: number | null;
  peopleName: string | null;
  remarks: string | null;
  publicAt: string | null;
  closedAt: string | null;
  startHour: string | null;
  endHour: string | null;
  money: string | null;
};

export type NoticeUpdateInput = {
  title: string | null;
  station: string | null;
  locationId: number | null;
  people: number | null;
  peopleName: string | null;
  remarks: string | null;
  publicAt: string | null;
  closedAt: string | null;
  startHour: string | null;
  endHour: string | null;
  money: string | null;
};

export type NoticeCreateInput = NoticeUpdateInput;
