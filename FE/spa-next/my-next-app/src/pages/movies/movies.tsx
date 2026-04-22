import React from "react";
import MediaListPage from "@/components/functional/MediaListPage";
import { API_ENDPOINTS } from "@/api/apiEndpoints";

const MoviesPage: React.FC = () => {
  return (
    <MediaListPage
      title="映画一覧"
      endpoint={API_ENDPOINTS.MOVIE.LIST}
      queryKey="movies"
    />
  );
};

export default MoviesPage;
