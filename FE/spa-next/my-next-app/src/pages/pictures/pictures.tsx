import React from "react";
import MediaListPage from "@/components/functional/MediaListPage";
import { API_ENDPOINTS } from "@/api/apiEndpoints";

const PicturesPage: React.FC = () => {
  return (
    <MediaListPage
      title="画像一覧"
      endpoint={API_ENDPOINTS.PICTURE.LIST}
      queryKey="pictures"
    />
  );
};

export default PicturesPage;
