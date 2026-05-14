import React, { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
} from "@mui/material";
import type { SelectProps } from "@mui/material/Select";
import colors from "@/styles/colors";

type WheelDatePickerProps = {
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

const buildYearOptions = (centerYear: number, minYear: number, maxYear: number) => {
  const years: number[] = [];
  for (let year = minYear; year <= maxYear; year += 1) {
    years.push(year);
  }
  return years;
};

const WheelDatePicker: React.FC<WheelDatePickerProps> = ({
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
  const minYear = minDate?.year() ?? current.year() - 50;
  const maxYear = maxDate?.year() ?? current.year() + 50;
  const years = useMemo(() => buildYearOptions(baseYear, minYear, maxYear), [baseYear, minYear, maxYear]);
  const [year, setYear] = useState<number>(baseYear);
  const [month, setMonth] = useState<number>(current.month() + 1);
  const [day, setDay] = useState<number>(current.date());

  useEffect(() => {
    const next = value ?? dayjs();
    setYear(next.year());
    setMonth(next.month() + 1);
    setDay(next.date());
  }, [value]);

  const daysInMonth = dayjs(`${year}-${pad2(month)}-01`).daysInMonth();
  const dayOptions = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const isSelectable = (nextYear: number, nextMonth: number, nextDay: number): boolean => {
    const nextDate = dayjs(`${nextYear}-${pad2(nextMonth)}-${pad2(nextDay)}`);

    if (minDate && nextDate.isBefore(minDate, "day")) {
      return false;
    }
    if (maxDate && nextDate.isAfter(maxDate, "day")) {
      return false;
    }
    if (allowedDaysOfWeek && allowedDaysOfWeek.length > 0 && !allowedDaysOfWeek.includes(nextDate.day() as 0 | 1 | 2 | 3 | 4 | 5 | 6)) {
      return false;
    }
    return true;
  };

  const emitChange = (nextYear: number, nextMonth: number, nextDay: number) => {
    if (!isSelectable(nextYear, nextMonth, nextDay)) {
      onChange?.(undefined);
      return;
    }
    onChange?.(dayjs(`${nextYear}-${pad2(nextMonth)}-${pad2(nextDay)}`));
  };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    const nextYear = Number(event.target.value);
    const nextDaysInMonth = dayjs(`${nextYear}-${pad2(month)}-01`).daysInMonth();
    const nextDay = Math.min(day, nextDaysInMonth);
    setYear(nextYear);
    setDay(nextDay);
    emitChange(nextYear, month, nextDay);
  };

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    const nextMonth = Number(event.target.value);
    const nextDaysInMonth = dayjs(`${year}-${pad2(nextMonth)}-01`).daysInMonth();
    const nextDay = Math.min(day, nextDaysInMonth);
    setMonth(nextMonth);
    setDay(nextDay);
    emitChange(year, nextMonth, nextDay);
  };

  const handleDayChange = (event: SelectChangeEvent<number>) => {
    const nextDay = Number(event.target.value);
    setDay(nextDay);
    emitChange(year, month, nextDay);
  };

  const disabledBg = colors.nonActiveGray ?? "#f0f0f0";
  const labelId = `${label.replace(/\s+/g, "-").toLowerCase()}-label`;
  const yearLabelId = `${labelId}-year`;
  const monthLabelId = `${labelId}-month`;
  const dayLabelId = `${labelId}-day`;

  return (
    <FormControl fullWidth sx={{ ...customStyle }} error disabled={disabled}>
      <Stack direction="row" spacing={1}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 110 }}>
          <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            {label} 年
          </Box>
          <Select
            labelId={yearLabelId}
            value={year}
            onChange={handleYearChange as SelectProps<number>["onChange"]}
            disabled={disabled}
            sx={{
              minWidth: 110,
              "& .MuiSelect-select.Mui-disabled": {
                opacity: 1,
                WebkitTextFillColor: colors.inputText,
                backgroundColor: disabledBg,
              },
            }}
          >
            {years.map((item) => (
              <MenuItem key={item} value={item}>
                {item}年
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 96 }}>
          <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            月
          </Box>
          <Select
            labelId={monthLabelId}
            value={month}
            onChange={handleMonthChange as SelectProps<number>["onChange"]}
            disabled={disabled}
            sx={{
              minWidth: 96,
              "& .MuiSelect-select.Mui-disabled": {
                opacity: 1,
                WebkitTextFillColor: colors.inputText,
                backgroundColor: disabledBg,
              },
            }}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
              <MenuItem key={item} value={item}>
                {item}月
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 96 }}>
          <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            日
          </Box>
          <Select
            labelId={dayLabelId}
            value={day}
            onChange={handleDayChange as SelectProps<number>["onChange"]}
            disabled={disabled}
            sx={{
              minWidth: 96,
              "& .MuiSelect-select.Mui-disabled": {
                opacity: 1,
                WebkitTextFillColor: colors.inputText,
                backgroundColor: disabledBg,
              },
            }}
          >
            {dayOptions.map((item) => (
              <MenuItem key={item} value={item} disabled={!isSelectable(year, month, item)}>
                {item}日
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Stack>
      <Box
        sx={{
          mt: 0.5,
          minHeight: "1.25rem",
          color: error ? "error.main" : "text.secondary",
          fontSize: "0.75rem",
        }}
      >
        {helperText || placeholder || " "}
      </Box>
    </FormControl>
  );
};

export default WheelDatePicker;
