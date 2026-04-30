import React, { useEffect, useRef } from "react";
import { Box, Typography, Divider } from "@mui/material";

const mermaidChart = `
flowchart TD
  A[リーダー：太一] -->|引き継ぎ| B[リーダー代理：後藤]
  B -->|分担| D[施設予約：和田]
  B -->|分担| E["備品管理等：高村"]
`;

const InfoPage: React.FC = () => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMermaid = async () => {
      const mermaid = (await import("mermaid")).default;

      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
      });

      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = mermaidChart;
        await mermaid.run({
          nodes: [mermaidRef.current],
        });
      }
    };

    void loadMermaid();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">🏀 開催頻度</Typography>
      <ul>
        <li>月1〜2回程度</li>
      </ul>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">👥 運用体制</Typography>
      <Box
        ref={mermaidRef}
        className="mermaid"
        sx={{
          width: "100%",
          overflowX: "auto",
          my: 2,
        }}
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">🎒 各自持参</Typography>
      <ul>
        <li>室内用シューズ（バッシュなど）</li>
        <li>※屋外シューズは基本NG</li>
        <li>着替え & タオル</li>
        <li>現金 or 電子マネー</li>
        <li>ドリンク</li>
        <li>バスケットボール</li>
        <li>ビブス</li>
        <li>ボードゲーム</li>
      </ul>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">📦 持ち物分担</Typography>
      <ul>
        <li>三脚：和田</li>
        <li>iPad：後藤</li>
        <li>空気入れ：後藤</li>
        <li>ボード：和田</li>
        <li>ビブス予備：高村</li>
      </ul>
    </Box>
  );
};

export default InfoPage;
