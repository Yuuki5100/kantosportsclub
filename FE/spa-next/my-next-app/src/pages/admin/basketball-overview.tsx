import React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

type Section = {
  icon: string;
  title: string;
};

const schedule: { date: string; content: string }[] = [
  { date: "12日", content: "体育館抽選結果の発表" },
  { date: "13日", content: "イベント参加アンケート開始" },
  { date: "17日", content: "アンケート締切・参加メンバーで日程調整" },
  { date: "25日", content: "翌月の体育館抽選アンケート開始" },
  { date: "31日", content: "体育館の抽選申込み" },
];

/** 各セクションを囲む軽いカード */
const SectionCard: React.FC<Section & { children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
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

/** 本文用の箇条書き（行間・インデントを調整） */
const bulletSx = {
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

const InfoPage: React.FC = () => {
  return (
    <Box
      sx={{
        maxWidth: 820,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: { xs: 24, sm: 30 },
          letterSpacing: "0.01em",
        }}
      >
        ルール概要まとめ
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
        参加前に目を通しておいてください。
      </Typography>

      <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: { xs: 3, sm: 4 } }}>
        <SectionCard icon="🏀" title="チーム概要">
          <Box component="ul" sx={bulletSx}>
            <li>スポーツ（バスケットボールなど）やボードゲームをみんなで楽しむコミュニティです。</li>
            <li>
              メンバー同士の紹介制を基本としており、知り合い同士で安心して楽しめる環境を大切にしています。
            </li>
            <li>
              オフラインならではの交流や楽しさを重視し、運動やゲームを通じてリフレッシュできる場を目指しています。
            </li>
            <li>活動は月に1〜2回程度を予定しています。（バスケットボール・ボードゲームなど）</li>
          </Box>
        </SectionCard>

        <SectionCard icon="🗓" title="スケジュール調整">
          <Typography sx={{ mb: 2, lineHeight: 1.9, fontSize: { xs: 14, sm: 15 } }}>
            毎月、以下の流れでイベント調整を進めます。
          </Typography>

          <TableContainer
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflowX: "auto",
            }}
          >
            <Table size="small" sx={{ minWidth: 320 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "background.default" }}>
                  <TableCell
                    sx={{
                      width: { xs: 84, sm: 110 },
                      fontWeight: 700,
                      fontSize: 13,
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                      borderColor: "divider",
                    }}
                  >
                    日付
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "text.secondary",
                      borderColor: "divider",
                    }}
                  >
                    内容
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {schedule.map((row) => (
                  <TableRow
                    key={row.date}
                    sx={{
                      "&:last-of-type td": { border: 0 },
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        py: 1.25,
                        borderColor: "divider",
                      }}
                    >
                      {row.date}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1.25,
                        lineHeight: 1.7,
                        borderColor: "divider",
                      }}
                    >
                      {row.content}
                    </TableCell>
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
        </SectionCard>

        <SectionCard icon="✅" title="参加ルール">
          <Box component="ul" sx={bulletSx}>
            <li>イベント参加アンケートが開始されたら、参加・不参加の回答をお願いします。</li>
            <li>イベント参加時には参加費が必要です。</li>
            <li>参加費はイベント当日に集金します。</li>
            <li>PayPayなどの電子マネーでのお支払いにも対応しています。</li>
          </Box>
        </SectionCard>

        <SectionCard icon="🚫" title="キャンセルについて">
          <Box component="ul" sx={bulletSx}>
            <li>イベントへの参加をキャンセルする場合は、できるだけ早めのご連絡をお願いします。</li>
            <li>開催日の3日前以降にキャンセルされた場合は、キャンセル料が発生します。</li>
          </Box>

          <Box
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 2,
              bgcolor: "action.hover",
              borderLeft: "3px solid",
              borderColor: "primary.main",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 15 }, mb: 1 }}>
              キャンセル料
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 15 }, lineHeight: 1.9 }}>
              キャンセル料：参加費と同額
            </Typography>
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
          </Box>
        </SectionCard>
      </Stack>
    </Box>
  );
};

export default InfoPage;
