import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

/**
 * ルール系ドキュメントページ共通のセクションカード。
 * 影を使わず、薄いborderと余白で情報階層を作る。
 */
export const DocSectionCard: React.FC<{
  icon: string;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.5, sm: 3 },
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
      <Box component="span" sx={{ fontSize: 20, lineHeight: 1 }} aria-hidden>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: 17, sm: 18 } }}>
        {title}
      </Typography>
    </Stack>
    {children}
  </Paper>
);

/**
 * 補足を控えめに見せるコールアウト。
 * アクセントカラーは1色（primary.main）だけを左borderに使用する。
 */
export const DocCallout: React.FC<{
  title?: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}> = ({ title, children, sx }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: "action.hover",
      borderLeft: "3px solid",
      borderColor: "primary.main",
      ...sx,
    }}
  >
    {title && (
      <Typography sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 15 }, mb: 1 }}>
        {title}
      </Typography>
    )}
    {children}
  </Box>
);

/** 本文用の箇条書きスタイル（行間・インデントを読みやすく調整） */
export const docBulletSx = {
  m: 0,
  pl: 2.5,
  color: "text.primary",
  "& li": {
    mb: 1,
    lineHeight: 1.9,
    fontSize: { xs: 14, sm: 15 },
    "&:last-of-type": { mb: 0 },
  },
  "& ul": {
    mt: 1,
    mb: 0,
    pl: 2.5,
  },
} as const;

/** 本文テキスト共通スタイル */
export const docTextSx = {
  lineHeight: 1.9,
  fontSize: { xs: 14, sm: 15 },
} as const;

/** 表全体（角丸・薄い外枠・スマホ横スクロール） */
export const docTableContainerSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  overflowX: "auto",
} as const;

/** ヘッダー行（薄い背景色＋控えめなラベル） */
export const docTableHeadRowSx = {
  bgcolor: "background.default",
} as const;

export const docHeadCellSx = {
  fontWeight: 700,
  fontSize: 13,
  color: "text.secondary",
  borderColor: "divider",
} as const;

/** 本文行（最終行は下線なし・hoverで薄く反応） */
export const docTableBodyRowSx = {
  "&:last-of-type td": { border: 0 },
  "&:hover": { bgcolor: "action.hover" },
} as const;

export const docBodyCellSx = {
  py: 1.25,
  lineHeight: 1.7,
  borderColor: "divider",
} as const;

/** 1列目（見出し的な列）。幅を固定気味にして2列目を広くする */
export const docLabelCellSx = {
  fontWeight: 600,
  whiteSpace: "nowrap",
  py: 1.25,
  borderColor: "divider",
} as const;

/** ページ全体のラッパー（コンテンツ幅を制限して長文を読みやすくする） */
export const DocPageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      maxWidth: 820,
      mx: "auto",
      px: { xs: 2, sm: 3 },
      py: { xs: 3, sm: 4 },
    }}
  >
    {children}
  </Box>
);

/** ページタイトル＋リード文 */
export const DocPageHeader: React.FC<{ title: string; description?: string }> = ({
  title,
  description,
}) => (
  <Box>
    <Typography
      variant="h4"
      component="h1"
      sx={{ fontWeight: 700, fontSize: { xs: 24, sm: 30 }, letterSpacing: "0.01em" }}
    >
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
        {description}
      </Typography>
    )}
  </Box>
);
