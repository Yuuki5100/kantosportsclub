import React, { useEffect, useRef, useState } from "react";
import { Chip } from "@mui/material";
import { Box, Font14 } from "@/components/base";
import colors from "@/styles/colors";

export type CommunityLabel = "オフェンス" | "ディフェンス" | "ドライブ" | "ブロック" | "シュート";
export const COMMUNITY_LABELS: CommunityLabel[] = ["オフェンス", "ディフェンス", "ドライブ", "ブロック", "シュート"];

type Props = { value: string; onChange?: (value: string) => void; disabled?: boolean; showHint?: boolean };

const toggle = (value: string, label: CommunityLabel): string => {
  const selected = value.split("、").map((item) => item.trim()).filter(Boolean);
  return (selected.includes(label) ? selected.filter((item) => item !== label) : [...selected, label]).join("、");
};

const CommunityLabelSelector: React.FC<Props> = ({ value, onChange, disabled = false, showHint = true }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const inputRef = useRef<HTMLSpanElement>(null);
  const selected = value.split("、").map((item) => item.trim()).filter(Boolean);
  const customLabels = selected.filter((label) => !COMMUNITY_LABELS.includes(label as CommunityLabel) && label !== "その他");
  const addLabel = (input = newLabel) => {
    const label = input.trim();
    if (!label) return;
    const next = selected.includes(label) ? selected : [...selected, label];
    onChange?.(next.join("、"));
    setNewLabel("");
    setIsAdding(false);
  };
  const removeLabel = (label: string) => onChange?.(selected.filter((item) => item !== label).join("、"));
  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);
  return <>
    {showHint && <Font14 sx={{ display: "block", mt: 1, pb: 0.5, color: colors.grayDark }}>チップから選択することもできます</Font14>}
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.75 }}>
      {COMMUNITY_LABELS.map((label) => <Chip key={label} label={label} size="small" disabled={disabled} variant={selected.includes(label) ? "filled" : "outlined"} color={selected.includes(label) ? "primary" : "default"} clickable={!disabled} onClick={() => onChange?.(toggle(value, label))} />)}
      {customLabels.map((label) => <Chip key={label} label={label} size="small" color="primary" onDelete={disabled ? undefined : () => removeLabel(label)} sx={{ "& .MuiChip-deleteIcon": { color: "common.white" } }} />)}
      <Chip label="＋" size="small" disabled={disabled} clickable={!disabled} onClick={() => setIsAdding(true)} />
    </Box>
    {isAdding && <Box sx={{ mt: 1, display: "inline-flex", maxWidth: "100%", border: 1, borderColor: "primary.main", borderRadius: 1, px: 1.25, py: 0.5, color: "text.primary", bgcolor: "background.paper", outline: "none", fontSize: "0.8125rem" }}>
      <Box component="span" ref={inputRef} contentEditable suppressContentEditableWarning role="textbox" aria-label="タグを入力" data-placeholder="タグを入力" sx={{ minWidth: 56, maxWidth: "100%", outline: "none", whiteSpace: "pre-wrap", overflowWrap: "anywhere", "&:empty::before": { content: "attr(data-placeholder)", color: "text.disabled" } }} onInput={(event) => { const value = event.currentTarget.textContent ?? ""; const line = value.split("\n")[0]; setNewLabel(line); if (value.includes("\n")) addLabel(line); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLabel(event.currentTarget.textContent ?? newLabel); } }} onBlur={() => { if (newLabel.trim()) addLabel(); else setIsAdding(false); }} />
    </Box>}
  </>;
};

export default CommunityLabelSelector;
