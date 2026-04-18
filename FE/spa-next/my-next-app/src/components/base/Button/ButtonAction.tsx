import React from "react";
import ButtonBase from "./ButtonBase";
import type { ButtonProps } from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";

type ButtonActionProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  size?: "small" | "medium" | "large";
  width?: number | string;
  type?: "button" | "submit" | "reset";
  variant?: ButtonProps["variant"];
  sx?: SxProps<Theme>;
};

const ButtonAction: React.FC<ButtonActionProps> = (props) => {
  return <ButtonBase {...props} />;
};

export default ButtonAction;
