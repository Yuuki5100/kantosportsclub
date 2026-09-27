export type PracticeMovieItem = {
  id: number;
  title: string | null;
  url: string | null;
  note: string | null;
  label: string | null;
  author: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PracticeMovieSearchFilter = { title?: string; label?: string; author?: string };
export type PracticeMovieCreateInput = { title: string; url: string; note: string | null; label: string; author: string };
export type PracticeMovieRow = Omit<PracticeMovieItem, "createdAt" | "updatedAt"> & { created_at: string | null; updated_at: string | null };
