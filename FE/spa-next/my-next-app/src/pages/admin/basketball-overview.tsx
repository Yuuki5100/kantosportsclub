import React from "react";
import {
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const schedule = [
  { date: "12日", content: "体育館抽選結果の発表" },
  { date: "13日", content: "イベント参加アンケート開始" },
  { date: "17日", content: "アンケート締切・参加メンバーで日程調整" },
  { date: "25日", content: "翌月の体育館抽選アンケート開始" },
  { date: "31日", content: "体育館の抽選申込み" },
];

const InfoPage: React.FC = () => {
  return (
    <Box sx={{ width: "min(100vw - 32px, 1280px)", maxWidth: "100%", mx: "auto", p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        ルール概要まとめ
      </Typography>

      <Typography variant="h6">🏀 チーム概要</Typography>
      <ul>
        <li>スポーツ（バスケットボールなど）やボードゲームをみんなで楽しむコミュニティです。</li>
        <li>
          メンバー同士の紹介制を基本としており、知り合い同士で安心して楽しめる環境を大切にしています。
        </li>
        <li>
          オフラインならではの交流や楽しさを重視し、運動やゲームを通じてリフレッシュできる場を目指しています。
        </li>
        <li>活動は月に1〜2回程度を予定しています。（バスケットボール・ボードゲームなど）</li>
      </ul>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">🗓 スケジュール調整</Typography>
      <ul>
        <li>毎月、以下の流れでイベント調整を進めます。</li>
      </ul>
      <TableContainer component={Paper} sx={{ my: 2, maxWidth: 600 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>日付</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>内容</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((row) => (
              <TableRow key={row.date}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{row.date}</TableCell>
                <TableCell>{row.content}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="body2" color="text.secondary">
        ※日程は状況により前後する場合があります。
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">✅ 参加ルール</Typography>
      <ul>
        <li>イベント参加アンケートが開始されたら、参加・不参加の回答をお願いします。</li>
        <li>イベント参加時には参加費が必要です。</li>
        <li>参加費はイベント当日に集金します。</li>
        <li>PayPayなどの電子マネーでのお支払いにも対応しています。</li>
      </ul>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">🚫 キャンセルについて</Typography>
      <ul>
        <li>イベントへの参加をキャンセルする場合は、できるだけ早めのご連絡をお願いします。</li>
        <li>開催日の3日前以降にキャンセルされた場合は、キャンセル料が発生します。</li>
      </ul>

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 2 }}>
        ★キャンセル料
      </Typography>
      <ul>
        <li>キャンセル料：参加費と同額</li>
        <li>
          例）イベント開催日：7月18日（土）
          <ul>
            <li>7月14日以前の連絡：キャンセル料なし</li>
            <li>7月15日以降の連絡：キャンセル料あり</li>
          </ul>
        </li>
      </ul>
    </Box>
  );
};

export default InfoPage;
