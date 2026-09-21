// components/button/ButtonBack.tsx
import React from "react";
import MUIButton from "./ButtonBase";
import { SxProps, Theme } from "@mui/material/styles";

// ButtonBase と同様の props を受け取れるように定義
type ButtonBackProps = {
  onClick: () => void;
  disabled?: boolean;
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  size?: "small" | "medium" | "large";
  width?: number | string;
  sx?: SxProps<Theme>;
};

const ButtonBack: React.FC<ButtonBackProps> = ({
  onClick,
  disabled,
  color = "secondary", // デフォルト色を back ボタン向けに "secondary"
  size,
  width,
  sx,
}) => {
  return (
    <MUIButton
      label="戻る"
      onClick={onClick}
      disabled={disabled}
      color={color}
      size={size}
      width={width}
      sx={{
        color: "#000",
        backgroundColor: "#fff",
        border: "1px solid #000",
        "&:hover": {
          backgroundColor: "#f5f5f5",
          borderColor: "#000",
        },
        ...sx,
      }}
    />
  );
};

export default ButtonBack;
