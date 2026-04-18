import React, { useState } from "react";
import {
  Box,
  CheckBox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";

type Member = "斎藤" | "田沼" | "高崎" | "後藤" | "孟";
type Duty = "ポスト" | "電話(メイン)" | "電話(サブ)" | "給茶機" | "";

const members: Member[] = ["斎藤", "田沼", "高崎", "後藤", "孟"];
const days = ["月", "火", "水", "木", "金"];
const mustPhoneMainMembers: Member[] = ["田沼", "高崎", "後藤"];

interface Schedule {
  [day: string]: {
    [member in Member]: Duty;
  };
}

interface Holiday {
  member: Member;
  days: string[];
}

const generateSchedule = (holidays: Holiday[]): Schedule => {
  const schedule: Schedule = {};
  const phoneMainCount: Record<Member, number> = members.reduce(
    (acc, m) => ({ ...acc, [m]: 0 }),
    {} as Record<Member, number>
  );
  const pendingPhoneMain = new Set<Member>(mustPhoneMainMembers);

  // 1人1日まで空白日にする（ポスト・給茶機は除外）
  const emptyDayForMember: Record<Member, string> = {} as Record<Member, string>;
  const usedEmptyDays: string[] = [];
  members.forEach((m) => {
    if (m === "斎藤" || m === "孟") return; // ポスト・給茶機は空白日なし
    const availableDays = days.filter(
      (day) =>
        !holidays.find((h) => h.member === m)?.days.includes(day) &&
        !usedEmptyDays.includes(day)
    );
    if (availableDays.length > 0) {
      const day = availableDays[Math.floor(Math.random() * availableDays.length)];
      emptyDayForMember[m] = day;
      usedEmptyDays.push(day);
    }
  });

  days.forEach((day) => {
    schedule[day] = members.reduce(
      (acc, m) => ({ ...acc, [m]: "" as Duty }),
      {} as Record<Member, Duty>
    );

    const dayOffMembers = holidays
      .filter((h) => h.days.includes(day))
      .map((h) => h.member);

    const availableMembers = members.filter(
      (m) => !dayOffMembers.includes(m) && emptyDayForMember[m] !== day
    );

    // ポスト・給茶機割り当て
    if (availableMembers.includes("斎藤")) schedule[day]["斎藤"] = "ポスト";
    if (availableMembers.includes("孟")) schedule[day]["孟"] = "給茶機";

    // 電話候補
    const phoneCandidates: Member[] = (["田沼", "高崎", "後藤"] as Member[]).filter(
      (m) => availableMembers.includes(m) && phoneMainCount[m] < 2
    );

    const priorityCandidates: Member[] = phoneCandidates.filter((m) =>
      pendingPhoneMain.has(m)
    );

    const main: Member | null =
      priorityCandidates.length > 0
        ? (() => {
          const selected = priorityCandidates[Math.floor(Math.random() * priorityCandidates.length)];
          pendingPhoneMain.delete(selected);
          return selected;
        })()
        : phoneCandidates.length > 0
          ? phoneCandidates[Math.floor(Math.random() * phoneCandidates.length)]
          : null;

    if (main) {
      schedule[day][main] = "電話(メイン)";
      phoneMainCount[main] += 1;

      const subCandidates = phoneCandidates.filter((m) => m !== main);
      if (subCandidates.length > 0) {
        const sub: Member =
          subCandidates[Math.floor(Math.random() * subCandidates.length)];
        schedule[day][sub] = "電話(サブ)";
      }
    }

    // 未割当のポスト/給茶機を空白の人に割り当て
    const dutiesToFill: Duty[] = [];
    if (!Object.values(schedule[day]).includes("ポスト")) dutiesToFill.push("ポスト");
    if (!Object.values(schedule[day]).includes("給茶機")) dutiesToFill.push("給茶機");

    dutiesToFill.forEach((duty) => {
      // 空白日・休みを無視してまだ何も割り当てられていない人から選ぶ
      const emptyMember = members.find((m) => schedule[day][m] === "");
      if (emptyMember) schedule[day][emptyMember] = duty;
    });

    // 当日未割当の duty をリストアップ
    const requiredDuties: Duty[] = ["ポスト", "給茶機", "電話(メイン)", "電話(サブ)"];
    requiredDuties.forEach((duty) => {
      if (!Object.values(schedule[day]).includes(duty)) {
        // 空セルの人から割り当て
        const emptyMember = members.find((m) => schedule[day][m] === "");
        if (emptyMember) {
          schedule[day][emptyMember] = duty;
        } else {
          // 全員埋まっている場合はランダム上書きでも良い
          const randomMember = members[Math.floor(Math.random() * members.length)];
          schedule[day][randomMember] = duty;
        }
      }
    });

    // 空白セルに可能な当番を割り当て（空白日除く）
    availableMembers.forEach((m) => {
      if (schedule[day][m] === "") {
        const assignableDuties: Duty[] = ["ポスト", "給茶機", "電話(サブ)"];
        for (const duty of assignableDuties) {
          if (!Object.values(schedule[day]).includes(duty)) {
            schedule[day][m] = duty;
            break;
          }
        }
      }
    });
  });

  return schedule;
};

const DutyRoster: React.FC = () => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>(
    members.map((m) => ({ member: m, days: [] }))
  );

  const updateMemberHolidays = (member: Member, selectedDays: string[]) => {
    setHolidays((prev) =>
      prev.map((h) =>
        h.member === member
          ? {
              member,
              days: selectedDays,
            }
          : h
      )
    );
  };

  const getCellColor = (duty: Duty, member: Member, day: string) => {
    const isHoliday = holidays.find((h) => h.member === member)?.days.includes(day);
    if (isHoliday) return "lightgray";

    switch (duty) {
      case "ポスト":
        return "pink";
      case "給茶機":
        return "lightblue";
      case "電話(メイン)":
        return "yellowgreen"; // 背景色逆
      case "電話(サブ)":
        return "lightgreen"; // 背景色逆
      default:
        return undefined;
    }
  };

  return (
    <Box p={2}>
      {/* 休み設定 UI */}
      <Box mb={2}>
        {members.map((member) => (
          <Box key={member} mb={1}>
            <strong>{member}の休み:</strong>
            <CheckBox
              name={`holiday-${member}`}
              options={days.map((day) => ({ value: day, label: day }))}
              selectedValues={holidays.find((h) => h.member === member)?.days ?? []}
              onChange={(selectedDays) => updateMemberHolidays(member, selectedDays)}
              direction="row"
            />
          </Box>
        ))}
      </Box>

      {/* 当番表作成ボタン */}
      <ButtonAction
        label="当番表を作成"
        color="primary"
        onClick={() => setSchedule(generateSchedule(holidays))}
      />

      {/* 当番表 */}
      {schedule && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: "yellow" }}>担当</TableCell>
                {days.map((day) => (
                  <TableCell key={day} align="center" sx={{ backgroundColor: "yellow", fontWeight: "bold" }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member}>
                  <TableCell>{member}</TableCell>
                  {days.map((day) => (
                    <TableCell
                      key={day}
                      align="center"
                      sx={{ backgroundColor: getCellColor(schedule[day][member], member, day) }}
                    >
                      {schedule[day][member]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DutyRoster;
