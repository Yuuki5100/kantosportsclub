// components/button/ButtonBase.tsx
import React from "react";
import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";
import { SxProps, Theme } from "@mui/material/styles";

// 🎯 デフォルト設定（メンテナンス性向上のため定数化）
const DEFAULT_DISABLED = false;
const DEFAULT_COLOR = "primary";
const DEFAULT_SIZE = "medium";
const DEFAULT_VARIANT = "contained";
const DEFAULT_MIN_WIDTH = 100; // 幅未指定時の最低幅

// プロパティ型定義（ButtonBase で受け取れる引数を定義）
type MUIButtonProps = {
  label: string; // ボタンに表示するテキスト
  onClick?: () => void; // クリック時に実行する関数
  disabled?: boolean; // 無効化フラグ（省略時は false）
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning"; // カラー種別（MUI規定）
  size?: "small" | "medium" | "large"; // サイズ種別
  width?: number | string; // 任意の幅（例：200, "100%"）
  type?: "button" | "submit" | "reset";
  variant?: ButtonProps["variant"];
  sx?: SxProps<Theme>; // MUIのスタイル拡張用（外部からスタイル上書き可能）
};

// ボタンベースコンポーネント（他ボタンの共通土台として使用）
const MUIButton: React.FC<MUIButtonProps> = ({
  label,
  onClick,
  disabled = DEFAULT_DISABLED,
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  width, // 幅が指定されていれば適用
  type = "button",
  variant = DEFAULT_VARIANT,
  sx = {}, // 外部から追加スタイルを受け取る
}) => {
  return (
    <Button
      variant={variant} // ボタンスタイル（基本は contained）
      color={color}
      size={size}
      disabled={disabled}
      onClick={onClick}
      type={type}
      sx={{
        // 幅が指定されていれば優先、なければ最小幅を確保
        ...(width !== undefined ? { width } : { minWidth: DEFAULT_MIN_WIDTH }),
        px: 3, // 横の余白（padding-left/right）でラベルにゆとりを持たせる
        ...sx, // 外部スタイルを上書き可能にする
      }}
    >
      {label} {/* ボタン内に表示されるテキスト */}
    </Button>
  );
};

export default MUIButton;
