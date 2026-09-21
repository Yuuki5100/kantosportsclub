import React from "react";
import { Chip } from "@mui/material";
import { Box, Font14 } from "@/components/base";
import colors from "@/styles/colors";

export type CommunityLabel = "オフェンス" | "ディフェンス" | "ドライブ" | "ブロック" | "シュート" | "戦術" | "その他";
export const COMMUNITY_LABELS: CommunityLabel[] = ["オフェンス", "ディフェンス", "ドライブ", "ブロック", "シュート", "戦術", "その他"];

type Props = { value: string; onChange?: (value: string) => void; disabled?: boolean; showHint?: boolean };

const toggle = (value: string, label: CommunityLabel): string => {
  const selected = value.split("、").map((item) => item.trim()).filter(Boolean);
  return (selected.includes(label) ? selected.filter((item) => item !== label) : [...selected, label]).join("、");
};

const CommunityLabelSelector: React.FC<Props> = ({ value, onChange, disabled = false, showHint = true }) => {
  const selected = value.split("、").map((item) => item.trim());
  return <>
    {showHint && <Font14 sx={{ display: "block", mt: 1, pb: 0.5, color: colors.grayDark }}>チップから選択することもできます</Font14>}
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.75 }}>
      {COMMUNITY_LABELS.map((label) => <Chip key={label} label={label} size="small" disabled={disabled} variant={selected.includes(label) ? "filled" : "outlined"} color={selected.includes(label) ? "primary" : "default"} clickable={!disabled} onClick={() => onChange?.(toggle(value, label))} />)}
    </Box>
  </>;
};

export default CommunityLabelSelector;
