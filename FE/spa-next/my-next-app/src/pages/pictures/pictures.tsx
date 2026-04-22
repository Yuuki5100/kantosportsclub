import React from "react";
import MediaListPage from "@/components/functional/MediaListPage";

const PicturesPage: React.FC = () => {
  return (
    <MediaListPage
      title="画像一覧"
      endpoint="/pictures"
      queryKey="pictures"
    />
  );
};

export default PicturesPage;
