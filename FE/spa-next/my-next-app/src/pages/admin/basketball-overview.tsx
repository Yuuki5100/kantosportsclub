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

const schedule: { date: string; content: string }[] = [
  { date: "12日", content: "体育館抽選結果の発表" },
  { date: "13日", content: "イベント参加アンケート開始" },
  { date: "17日", content: "アンケート締切・参加メンバーで日程調整" },
  { date: "25日", content: "翌月の体育館抽選アンケート開始" },
  { date: "31日", content: "体育館の抽選申込み" },
];

const InfoPage: React.FC = () => {
  return (
    <DocPageContainer>
      <DocPageHeader
        title="ルール概要まとめ"
        description="参加前に目を通しておいてください。"
      />

      <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: { xs: 3, sm: 4 } }}>
        <DocSectionCard icon="🏀" title="チーム概要">
          <Box component="ul" sx={docBulletSx}>
            <li>スポーツ（バスケットボールなど）やボードゲームをみんなで楽しむコミュニティです。</li>
            <li>
              メンバー同士の紹介制を基本としており、知り合い同士で安心して楽しめる環境を大切にしています。
            </li>
            <li>
              オフラインならではの交流や楽しさを重視し、運動やゲームを通じてリフレッシュできる場を目指しています。
            </li>
            <li>活動は月に1〜2回程度を予定しています。（バスケットボール・ボードゲームなど）</li>
          </Box>
        </DocSectionCard>

        <DocSectionCard icon="🗓" title="スケジュール調整">
          <Typography sx={{ ...docTextSx, mb: 2 }}>
            毎月、以下の流れでイベント調整を進めます。
          </Typography>

          <TableContainer sx={docTableContainerSx}>
            <Table size="small" sx={{ minWidth: 320 }}>
              <TableHead>
                <TableRow sx={docTableHeadRowSx}>
                  <TableCell
                    sx={{ ...docHeadCellSx, width: { xs: 84, sm: 110 }, whiteSpace: "nowrap" }}
                  >
                    日付
                  </TableCell>
                  <TableCell sx={docHeadCellSx}>内容</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {schedule.map((row) => (
                  <TableRow key={row.date} sx={docTableBodyRowSx}>
                    <TableCell sx={docLabelCellSx}>{row.date}</TableCell>
                    <TableCell sx={docBodyCellSx}>{row.content}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1.5, color: "text.secondary", lineHeight: 1.7 }}
          >
            ※ 日程は状況により前後する場合があります。
          </Typography>
        </DocSectionCard>

        <DocSectionCard icon="✅" title="参加ルール">
          <Box component="ul" sx={docBulletSx}>
            <li>イベント参加アンケートが開始されたら、参加・不参加の回答をお願いします。</li>
            <li>イベント参加時には参加費が必要です。</li>
            <li>参加費はイベント当日に集金します。</li>
            <li>PayPayなどの電子マネーでのお支払いにも対応しています。</li>
          </Box>
        </DocSectionCard>

        <DocSectionCard icon="🚫" title="キャンセルについて">
          <Box component="ul" sx={docBulletSx}>
            <li>イベントへの参加をキャンセルする場合は、できるだけ早めのご連絡をお願いします。</li>
            <li>開催日の3日前以降にキャンセルされた場合は、キャンセル料が発生します。</li>
          </Box>

          <DocCallout title="キャンセル料" sx={{ mt: 2.5 }}>
            <Typography sx={docTextSx}>キャンセル料：参加費と同額</Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1.5, color: "text.secondary", lineHeight: 1.9 }}
            >
              例）イベント開催日：7月18日（土）
            </Typography>
            <Box
              component="ul"
              sx={{
                m: 0,
                mt: 0.5,
                pl: 2.5,
                color: "text.secondary",
                "& li": { fontSize: 14, lineHeight: 1.9 },
              }}
            >
              <li>7月14日以前の連絡：キャンセル料なし</li>
              <li>7月15日以降の連絡：キャンセル料あり</li>
            </Box>
          </DocCallout>
        </DocSectionCard>
      </Stack>
    </DocPageContainer>
  );
};

export default InfoPage;
