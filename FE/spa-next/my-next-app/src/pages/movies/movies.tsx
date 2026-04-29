import React, { useCallback } from "react";
import { useRouter } from "next/router";
import MediaListPage, { type MediaItem } from "@/components/functional/MediaListPage";
import { API_ENDPOINTS } from "@/api/apiEndpoints";

const MoviesPage: React.FC = () => {
  const router = useRouter();

  const handleItemClick = useCallback(
    (movie: MediaItem) => {
      router.push({
        pathname: "/movies/detail",
        query: {
          id: String(movie.id),
          title: movie.title ?? "",
          description: movie.description ?? "",
          url: movie.url ?? "",
          locationName: movie.locationName ?? "",
          createdAt: movie.createdAt ?? "",
          updatedAt: movie.updatedAt ?? "",
        },
      });
    },
    [router]
  );

  return (
    <MediaListPage
      title="動画一覧"
      endpoint={API_ENDPOINTS.MOVIE.LIST}
      queryKey="movies"
      enableTitleDescriptionSearch
      onItemClick={handleItemClick}
    />
  );
};

export default MoviesPage;
