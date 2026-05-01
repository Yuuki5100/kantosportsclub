export type BoardgameItem = {
  id: number;
  boardgameName: string | null;
  ownerName: string | null;
  peopleMin: number | null;
  peopleMax: number | null;
  needTime: number | null;
  urlStr: string | null;
  howToPlay: string | null;
  remarks: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  imageUrl1: string | null;
  imageUrl2: string | null;
};

export type BoardgameRow = {
  id: number;
  boardgame_name: string | null;
  owner_name: string | null;
  people_min: number | null;
  people_max: number | null;
  need_time: number | null;
  url_str: string | null;
  how_to_play: string | null;
  remarks: string | null;
  created_at: string | null;
  updated_at: string | null;
  image_url1: string | null;
  image_url2: string | null;
};

export type BoardgameSearchFilter = {
  boardgameName?: string;
  ownerName?: string;
  people?: string;
  needTime?: string;
};

export type BoardgameCreateInput = {
  boardgameName: string | null;
  ownerName: string | null;
  peopleMin: number | null;
  peopleMax: number | null;
  needTime: number | null;
  urlStr: string | null;
  howToPlay: string | null;
  remarks: string | null;
};
