import React from "react";
import MediaListPage from "@/components/functional/MediaListPage";

const MoviesPage: React.FC = () => {
  return (
    <MediaListPage
      title="映画一覧"
      endpoint="/movies"
      queryKey="movies"
    />
  );
};

export default MoviesPage;
