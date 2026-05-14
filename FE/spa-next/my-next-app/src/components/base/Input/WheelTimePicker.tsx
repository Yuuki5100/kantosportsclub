import React, { useEffect, useMemo, useState } from 'react';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormHelperText,
} from '@mui/material';

type WheelTimePickerProps = {
  label?: string;
  value?: Dayjs | null;
  onChange?: (newValue: Dayjs | undefined) => void;
  open?: boolean;
  onClose?: () => void;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  placeholder?: string;
  customStyle?: object;
};

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 5;

const WheelTimePicker: React.FC<WheelTimePickerProps> = ({
  label = '時刻を選択',
  value,
  onChange,
  open,
  onClose,
  disabled = false,
  helperText,
  error,
  placeholder = 'HH:mm',
  customStyle = {},
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const dialogOpen = open ?? internalOpen;

  const [selectedHour, setSelectedHour] = useState<number>(
    value ? value.hour() : dayjs().hour()
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    value ? value.minute() : dayjs().minute()
  );

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const displayValue = value ? value.format('HH:mm') : '';

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }

    setSelectedHour(value ? value.hour() : dayjs().hour());
    setSelectedMinute(value ? value.minute() : dayjs().minute());
  }, [dialogOpen, value]);

  const handleOpen = () => {
    if (disabled) return;

    setSelectedHour(value ? value.hour() : dayjs().hour());
    setSelectedMinute(value ? value.minute() : dayjs().minute());
    if (open === undefined) {
      setInternalOpen(true);
    }
  };

  const handleCancel = () => {
    if (open === undefined) {
      setInternalOpen(false);
    }
    onClose?.();
  };

  const handleOk = () => {
    const base = value ?? dayjs();
    onChange?.(
      base
        .hour(selectedHour)
        .minute(selectedMinute)
        .second(0)
        .millisecond(0)
    );
    if (open === undefined) {
      setInternalOpen(false);
    }
    onClose?.();
  };

  const renderWheel = (
    items: number[],
    selectedValue: number,
    onSelect: (value: number) => void
  ) => {
    return (
      <Box
        sx={{
          height: ITEM_HEIGHT * VISIBLE_COUNT,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          textAlign: 'center',
          width: 90,
          borderTop: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        <Box sx={{ height: ITEM_HEIGHT * 2 }} />

        {items.map((item) => {
          const selected = item === selectedValue;

          return (
            <Box
              key={item}
              onClick={() => onSelect(item)}
              sx={{
                height: ITEM_HEIGHT,
                lineHeight: `${ITEM_HEIGHT}px`,
                scrollSnapAlign: 'center',
                fontSize: selected ? 24 : 18,
                fontWeight: selected ? 600 : 400,
                color: selected ? '#222' : '#aaa',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {String(item).padStart(2, '0')}
            </Box>
          );
        })}

        <Box sx={{ height: ITEM_HEIGHT * 2 }} />
      </Box>
    );
  };

  return (
    <>
      <TextField
        fullWidth
        label={label}
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        onClick={handleOpen}
        InputProps={{
          readOnly: true,
        }}
        sx={{ ...customStyle }}
      />

      {helperText && (
        <FormHelperText error={error}>
          {helperText}
        </FormHelperText>
      )}

      <Dialog open={dialogOpen} onClose={handleCancel} fullWidth maxWidth="xs">
        <DialogContent>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              py: 2,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: `calc(50% - ${ITEM_HEIGHT / 2}px)`,
                left: 0,
                right: 0,
                height: ITEM_HEIGHT,
                borderTop: '1px solid #ddd',
                borderBottom: '1px solid #ddd',
                pointerEvents: 'none',
              }}
            />

            {renderWheel(hours, selectedHour, setSelectedHour)}

            <Box
              sx={{
                fontSize: 24,
                fontWeight: 600,
                color: '#333',
              }}
            >
              :
            </Box>

            {renderWheel(minutes, selectedMinute, setSelectedMinute)}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancel}>キャンセル</Button>
          <Button onClick={handleOk} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WheelTimePicker;
