import React from "react";
import { useRouter } from "next/router";
import ButtonBack from "@/components/base/Button/ButtonBack";

const BackToTopButton: React.FC = () => {
  const router = useRouter();

  return <ButtonBack onClick={() => void router.push("/")} />;
};

export default BackToTopButton;
