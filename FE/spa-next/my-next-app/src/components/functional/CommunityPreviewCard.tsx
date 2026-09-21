import React from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { Box } from "@/components/base";

export type CommunityPreviewCardProps = {
  title: string | null;
  note: string | null;
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

const CommunityPreviewCard: React.FC<CommunityPreviewCardProps> = ({ title, note, url, preview, onClick }) => {
  const displayUrl = preview?.url ?? url;
  return (
    <Card component={onClick ? "div" : "a"} href={onClick ? undefined : displayUrl} target={onClick ? undefined : "_blank"} rel={onClick ? undefined : "noopener noreferrer"} onClick={onClick} sx={{ display: "flex", minHeight: 120, textDecoration: "none", color: "inherit", cursor: onClick ? "pointer" : "default" }}>
      {preview?.image ? <CardMedia component="img" image={preview.image} alt="" sx={{ width: { xs: 110, sm: 180 }, objectFit: "cover" }} /> : <Box sx={{ width: { xs: 110, sm: 180 }, flexShrink: 0, bgcolor: "grey.100" }} />}
      <CardContent sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>{preview?.title ?? title ?? displayUrl}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{preview?.description ?? note ?? ""}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>{preview?.siteName ?? getDomain(displayUrl)}</Typography>
        <Typography variant="caption" display="block" noWrap>{displayUrl}</Typography>
      </CardContent>
    </Card>
  );
};

export default CommunityPreviewCard;
