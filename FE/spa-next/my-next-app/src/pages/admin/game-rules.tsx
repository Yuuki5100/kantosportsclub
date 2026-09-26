import React from "react";
import {
  Box,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  DocCallout,
  DocPageContainer,
  DocPageHeader,
  DocSectionCard,
  docBodyCellSx,
  docBulletSx,
  docHeadCellSx,
  docLabelCellSx,
  docTableBodyRowSx,
  docTableContainerSx,
  docTableHeadRowSx,
  docTextSx,
} from "@/components/composite/DocSection";

const timeTable: { label: string; time: string }[] = [
  { label: "1Q", time: "3分間" },
  { label: "インターバル（休憩時間）", time: "3分間" },
  { label: "2Q", time: "3分間" },
];

const attackTable: { quarter: string; team: string; uniform: "blue" | "white" }[] = [
  { quarter: "1Q", team: "先攻チーム", uniform: "blue" },
  { quarter: "2Q", team: "後攻チーム", uniform: "white" },
];

const scoreTable: { area: string; point: string }[] = [
  { area: "2ポイントエリア内", point: "1点" },
  { area: "3ポイントエリア外", point: "2点" },
];

/** ユニフォーム色を示す小さなドット */
const UniformDot: React.FC<{ uniform: "blue" | "white" }> = ({ uniform }) => (
  <Box
    component="span"
    aria-hidden
    sx={{
      display: "inline-block",
      width: 10,
      height: 10,
      borderRadius: "50%",
      flexShrink: 0,
      bgcolor: uniform === "blue" ? "primary.main" : "background.paper",
      border: uniform === "blue" ? "none" : "1px solid",
      borderColor: "divider",
    }}
  />
);

const GameRulesPage: React.FC = () => {
  return (
    <DocPageContainer>
      <DocPageHeader
        title="バスケの試合ルールまとめ"
        description="当日の進行はこのルールに沿って行います。"
      />

      <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: { xs: 3, sm: 4 } }}>
        <DocSectionCard icon="🏀" title="試合概要">
          <Box component="ul" sx={docBulletSx}>
            <li>基本的に3対3で試合を行います。</li>
            <li>ハーフコート（ゴール1基）を使用します。</li>
            <li>使用球は7号球です。</li>
            <li>試合開始前にじゃんけんを行い、先攻・後攻を決定します。</li>
            <li>先攻チームは青ユニフォーム、後攻チームは白ユニフォームを着用します。</li>
          </Box>
        </DocSectionCard>

        <DocSectionCard icon="⏱" title="試合時間">
          <Typography sx={{ ...docTextSx, mb: 2 }}>試合は「2Q制」です。</Typography>

          <TableContainer sx={docTableContainerSx}>
            <Table size="small" sx={{ minWidth: 320 }}>
              <TableHead>
                <TableRow sx={docTableHeadRowSx}>
                  <TableCell sx={{ ...docHeadCellSx, width: { xs: 150, sm: 200 } }}>
                    区分
                  </TableCell>
                  <TableCell sx={docHeadCellSx}>時間</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeTable.map((row) => (
                  <TableRow key={row.label} sx={docTableBodyRowSx}>
                    <TableCell sx={docLabelCellSx}>{row.label}</TableCell>
                    <TableCell sx={docBodyCellSx}>{row.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography sx={{ ...docTextSx, mt: 3, mb: 2 }}>
            各クォーターの開始時は以下のチームから攻撃を開始します。
          </Typography>

          <TableContainer sx={docTableContainerSx}>
            <Table size="small" sx={{ minWidth: 320 }}>
              <TableHead>
                <TableRow sx={docTableHeadRowSx}>
                  <TableCell sx={{ ...docHeadCellSx, width: { xs: 84, sm: 110 } }}>
                    クォーター
                  </TableCell>
                  <TableCell sx={docHeadCellSx}>攻撃開始チーム</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attackTable.map((row) => (
                  <TableRow key={row.quarter} sx={docTableBodyRowSx}>
                    <TableCell sx={docLabelCellSx}>{row.quarter}</TableCell>
                    <TableCell sx={docBodyCellSx}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <UniformDot uniform={row.uniform} />
                        <Box component="span">
                          {row.team}（{row.uniform === "blue" ? "青" : "白"}チーム）
                        </Box>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DocSectionCard>

        <DocSectionCard icon="📋" title="基本ルール">
          <Box component="ul" sx={docBulletSx}>
            <li>基本的には通常のバスケットボールのルールで試合を行います。</li>
            <li>得点方法は「3x3ルール（1点・2点制）」を採用します。</li>
            <li>
              ファールの判定は通常よりやや緩めですが、ダブルドリブル・トラベリングは反則となります。
            </li>
            <li>試合終了時に得点が多いチームの勝利です。</li>
          </Box>

          <TableContainer sx={{ ...docTableContainerSx, mt: 2.5 }}>
            <Table size="small" sx={{ minWidth: 320 }}>
              <TableHead>
                <TableRow sx={docTableHeadRowSx}>
                  <TableCell sx={{ ...docHeadCellSx, width: { xs: 150, sm: 200 } }}>
                    シュートエリア
                  </TableCell>
                  <TableCell sx={docHeadCellSx}>得点</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scoreTable.map((row) => (
                  <TableRow key={row.area} sx={docTableBodyRowSx}>
                    <TableCell sx={docLabelCellSx}>{row.area}</TableCell>
                    <TableCell sx={docBodyCellSx}>{row.point}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DocSectionCard>

        <DocSectionCard icon="🤝" title="同点の場合（サドンデス・フリースロー）">
          <Box component="ul" sx={docBulletSx}>
            <li>2Q終了時に同点だった場合は、フリースロー対決で勝敗を決定します。</li>
          </Box>

          <Stack spacing={2} sx={{ mt: 2.5 }}>
            <DocCallout title="1回目">
              <Box component="ul" sx={docBulletSx}>
                <li>各チーム全員が1人1本ずつフリースローを行います。</li>
                <li>多く成功したチームの勝利です。</li>
              </Box>
            </DocCallout>

            <DocCallout title="それでも同点の場合（サドンデス）">
              <Box component="ul" sx={docBulletSx}>
                <li>全員が投げ終えても同点の場合は、サドンデス方式へ移行します。</li>
                <li>両チーム1人ずつ交互にフリースローを行います。</li>
                <li>先に成功数で1点差がついた時点で勝敗が決定します。</li>
                <li>シュートを打つ選手は順番に交代しながら行います。</li>
              </Box>
            </DocCallout>
          </Stack>
        </DocSectionCard>
      </Stack>
    </DocPageContainer>
  );
};

export default GameRulesPage;
