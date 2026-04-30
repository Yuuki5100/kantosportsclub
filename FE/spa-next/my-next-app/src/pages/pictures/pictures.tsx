import React, { useCallback } from "react";
import MediaListPage, { MediaItem } from "@/components/functional/MediaListPage";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { useRouter } from "next/router";

const PicturesPage: React.FC = () => {
  const router = useRouter();

  const handleItemClick = useCallback(
    (picture: MediaItem) => {
      router.push({
        pathname: "/pictures/detail",
        query: {
          id: String(picture.id),
          title: picture.title ?? "",
          description: picture.description ?? "",
          url: picture.url ?? "",
          locationName: picture.locationName ?? "",
          createdAt: picture.createdAt ?? "",
          updatedAt: picture.updatedAt ?? "",
        },
      });
    },
    [router]
  );

  return (
    <MediaListPage
      title="画像一覧"
      endpoint={API_ENDPOINTS.PICTURE.LIST}
      queryKey="pictures"
      enableTitleDescriptionSearch
      onItemClick={handleItemClick}
    />
  );
};

export default PicturesPage;
