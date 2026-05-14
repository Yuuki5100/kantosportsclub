import React, { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, FormControl, MenuItem, Select, Stack } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import colors from "@/styles/colors";

type WheelDateTimePickerProps = {
  label?: string;
  value?: Dayjs | null;
  onChange?: (newValue: Dayjs | undefined) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  allowedDaysOfWeek?: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  placeholder?: string;
  customStyle?: object;
};

const pad2 = (value: number) => String(value).padStart(2, "0");
const buildYears = (centerYear: number, minYear: number, maxYear: number) => {
  const years: number[] = [];
  for (let year = minYear; year <= maxYear; year += 1) years.push(year);
  return years;
};

const WheelDateTimePicker: React.FC<WheelDateTimePickerProps> = ({
  label = "日付を選択",
  value,
  onChange,
  minDate,
  maxDate,
  allowedDaysOfWeek,
  disabled = false,
  helperText,
  error,
  placeholder,
  customStyle = {},
}) => {
  const current = value ?? dayjs();
  const baseYear = current.year();
  const minYear = minDate?.year() ?? baseYear - 50;
  const maxYear = maxDate?.year() ?? baseYear + 50;
  const years = useMemo(() => buildYears(baseYear, minYear, maxYear), [baseYear, minYear, maxYear]);
  const [year, setYear] = useState(baseYear);
  const [month, setMonth] = useState(current.month() + 1);
  const [day, setDay] = useState(current.date());
  const [hour, setHour] = useState(current.hour());
  const [minute, setMinute] = useState(current.minute());

  useEffect(() => {
    const next = value ?? dayjs();
    setYear(next.year());
    setMonth(next.month() + 1);
    setDay(next.date());
    setHour(next.hour());
    setMinute(next.minute());
  }, [value]);

  const daysInMonth = dayjs(`${year}-${pad2(month)}-01`).daysInMonth();
  const dayOptions = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const hourOptions = Array.from({ length: 24 }, (_, index) => index);
  const minuteOptions = Array.from({ length: 60 }, (_, index) => index);

  const isSelectable = (nextYear: number, nextMonth: number, nextDay: number, nextHour: number, nextMinute: number): boolean => {
    const nextDate = dayjs(`${nextYear}-${pad2(nextMonth)}-${pad2(nextDay)}T${pad2(nextHour)}:${pad2(nextMinute)}:00`);
    if (minDate && nextDate.isBefore(minDate, "minute")) return false;
    if (maxDate && nextDate.isAfter(maxDate, "minute")) return false;
    if (allowedDaysOfWeek?.length && !allowedDaysOfWeek.includes(nextDate.day() as 0 | 1 | 2 | 3 | 4 | 5 | 6)) return false;
    return true;
  };

  const emitChange = (nextYear: number, nextMonth: number, nextDay: number, nextHour: number, nextMinute: number) => {
    if (!isSelectable(nextYear, nextMonth, nextDay, nextHour, nextMinute)) {
      onChange?.(undefined);
      return;
    }
    onChange?.(dayjs(`${nextYear}-${pad2(nextMonth)}-${pad2(nextDay)}T${pad2(nextHour)}:${pad2(nextMinute)}:00`));
  };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    const nextYear = Number(event.target.value);
    const nextDaysInMonth = dayjs(`${nextYear}-${pad2(month)}-01`).daysInMonth();
    const nextDay = Math.min(day, nextDaysInMonth);
    setYear(nextYear);
    setDay(nextDay);
    emitChange(nextYear, month, nextDay, hour, minute);
  };

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    const nextMonth = Number(event.target.value);
    const nextDaysInMonth = dayjs(`${year}-${pad2(nextMonth)}-01`).daysInMonth();
    const nextDay = Math.min(day, nextDaysInMonth);
    setMonth(nextMonth);
    setDay(nextDay);
    emitChange(year, nextMonth, nextDay, hour, minute);
  };

  const handleDayChange = (event: SelectChangeEvent<number>) => {
    const nextDay = Number(event.target.value);
    setDay(nextDay);
    emitChange(year, month, nextDay, hour, minute);
  };

  const handleHourChange = (event: SelectChangeEvent<number>) => {
    const nextHour = Number(event.target.value);
    setHour(nextHour);
    emitChange(year, month, day, nextHour, minute);
  };

  const handleMinuteChange = (event: SelectChangeEvent<number>) => {
    const nextMinute = Number(event.target.value);
    setMinute(nextMinute);
    emitChange(year, month, day, hour, nextMinute);
  };

  const disabledBg = colors.nonActiveGray ?? "#f0f0f0";

  return (
    <FormControl fullWidth sx={{ ...customStyle }} error disabled={disabled}>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {[
          { label: `${label} 年`, value: year, onChange: handleYearChange, options: years, width: 110, suffix: "年" },
          { label: "月", value: month, onChange: handleMonthChange, options: Array.from({ length: 12 }, (_, index) => index + 1), width: 96, suffix: "月" },
          { label: "日", value: day, onChange: handleDayChange, options: dayOptions, width: 96, suffix: "日" },
          { label: "時", value: hour, onChange: handleHourChange, options: hourOptions, width: 96, suffix: "時" },
          { label: "分", value: minute, onChange: handleMinuteChange, options: minuteOptions, width: 96, suffix: "分" },
        ].map((slot) => (
          <Box key={slot.label} sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: slot.width }}>
            <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
              {slot.label}
            </Box>
            <Select
              value={slot.value}
              onChange={slot.onChange as (event: SelectChangeEvent<unknown>) => void}
              disabled={disabled}
              sx={{
                minWidth: slot.width,
                "& .MuiSelect-select.Mui-disabled": {
                  opacity: 1,
                  WebkitTextFillColor: colors.inputText,
                  backgroundColor: disabledBg,
                },
              }}
            >
              {slot.options.map((item) => (
                <MenuItem key={item} value={item}>
                  {String(item).padStart(slot.label.endsWith("分") ? 2 : 0, "0")}{slot.suffix}
                </MenuItem>
              ))}
            </Select>
          </Box>
        ))}
      </Stack>
      <Box sx={{ mt: 0.5, minHeight: "1.25rem", color: error ? "error.main" : "text.secondary", fontSize: "0.75rem" }}>
        {helperText || placeholder || " "}
      </Box>
    </FormControl>
  );
};

export default WheelDateTimePicker;
