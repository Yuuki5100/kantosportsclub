import React from "react";
import { Card, CardContent, CardMedia, Chip, Typography } from "@mui/material";
import { Box } from "@/components/base";

export type CommunityPreviewCardProps = {
  title: string | null;
  note: string | null;
  label?: string | null;
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

const CommunityPreviewCard: React.FC<CommunityPreviewCardProps> = ({ title, note, label, author, url, preview, onClick }) => {
  const displayUrl = preview?.url ?? url;
  const tags = (label ?? "").split("、").map((tag) => tag.trim()).filter(Boolean);
  return (
    <Card component={onClick ? "div" : "a"} href={onClick ? undefined : displayUrl} target={onClick ? undefined : "_blank"} rel={onClick ? undefined : "noopener noreferrer"} onClick={onClick} sx={{ display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit", cursor: onClick ? "pointer" : "default" }}>
      <Box sx={{ position: "relative", width: "100%", height: { xs: 180, sm: 240 }, bgcolor: "grey.100" }}>
        {preview?.image ? <CardMedia component="img" image={preview.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      </Box>
      <CardContent sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>{title ?? ""}</Typography>
        <Typography variant="body2" noWrap>{preview?.title ?? displayUrl}</Typography>
        {note && <Typography variant="body2" color="text.secondary" noWrap>{note}</Typography>}
        {author && <Typography variant="caption" display="block" color="text.secondary" noWrap>投稿者: {author}</Typography>}
        {tags.length > 0 && <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
          {tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}
        </Box>}
      </CardContent>
    </Card>
  );
};

export default CommunityPreviewCard;
