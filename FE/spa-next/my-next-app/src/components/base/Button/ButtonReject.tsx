// components/button/ButtonReject.tsx
import React from "react";
import MUIButton from "./ButtonBase";
import { SxProps, Theme } from "@mui/material/styles";

// ButtonBase と同様の props を受け取れるように定義
type ButtonRejectProps = {
  onClick: () => void;
  disabled?: boolean;
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  size?: "small" | "medium" | "large";
  width?: number | string;
  sx?: SxProps<Theme>;
};

const ButtonReject: React.FC<ButtonRejectProps> = ({
  onClick,
  disabled,
  color = "error", // 削除ボタンらしくデフォルトは error
  size,
  width,
  sx,
}) => {
  return (
    <MUIButton
      label="削除"
      onClick={onClick}
      disabled={disabled}
      color={color}
      size={size}
      width={width}
      sx={sx}
    />
  );
};

export default ButtonReject;
