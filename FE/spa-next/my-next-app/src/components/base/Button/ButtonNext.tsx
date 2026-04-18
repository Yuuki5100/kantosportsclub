// components/button/ButtonNext.tsx
import React from "react";
import MUIButton from "./ButtonBase";
import { SxProps, Theme } from "@mui/material/styles";

// ButtonBase と同様の props を受け取れるように定義
type ButtonNextProps = {
  onClick: () => void;
  disabled?: boolean;
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  size?: "small" | "medium" | "large";
  width?: number | string;
  sx?: SxProps<Theme>;
};

const ButtonNext: React.FC<ButtonNextProps> = ({
  onClick,
  disabled,
  color = "primary", // 決定ボタンらしく primary をデフォルトに
  size,
  width,
  sx,
}) => {
  return (
    <MUIButton
      label="決定"
      onClick={onClick}
      disabled={disabled}
      color={color}
      size={size}
      width={width}
      sx={sx}
    />
  );
};

export default ButtonNext;
