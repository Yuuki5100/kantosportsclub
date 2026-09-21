import React from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { Box } from "@/components/base";

export type CommunityPreviewCardProps = {
  title: string | null;
  note: string | null;
  author?: string | null;
  url: string;
  preview: {
    url: string;
    title: string | null;
    description: string | null;
    image: string | null;
    siteName: string | null;
  } | null;
  onClick?: () => void;
};

const getDomain = (url: string): string => {
  try { return new URL(url).hostname; } catch { return url; }
};

const CommunityPreviewCard: React.FC<CommunityPreviewCardProps> = ({ title, note, author, url, preview, onClick }) => {
  const displayUrl = preview?.url ?? url;
  return (
    <Card component={onClick ? "div" : "a"} href={onClick ? undefined : displayUrl} target={onClick ? undefined : "_blank"} rel={onClick ? undefined : "noopener noreferrer"} onClick={onClick} sx={{ display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit", cursor: onClick ? "pointer" : "default" }}>
      {preview?.image ? <CardMedia component="img" image={preview.image} alt="" sx={{ width: "100%", height: { xs: 180, sm: 240 }, objectFit: "cover" }} /> : <Box sx={{ width: "100%", height: { xs: 180, sm: 240 }, bgcolor: "grey.100" }} />}
      <CardContent sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>{preview?.title ?? title ?? displayUrl}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>{preview?.siteName ?? getDomain(displayUrl)}</Typography>
        {author && <Typography variant="caption" display="block" color="text.secondary" noWrap>投稿者: {author}</Typography>}
      </CardContent>
    </Card>
  );
};

export default CommunityPreviewCard;
