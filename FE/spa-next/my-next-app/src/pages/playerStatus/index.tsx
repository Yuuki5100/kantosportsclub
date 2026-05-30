import React, { useEffect } from "react";
import { useRouter } from "next/router";

const PlayerStatusIndexPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/playerStatus/list");
  }, [router]);

  return null;
};

export default PlayerStatusIndexPage;
