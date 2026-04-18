
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Storybook全体にMUIのDatePickerプロバイダーを適用するためのデコレータ
export const withMuiDatePicker = (Story) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Story />
    </LocalizationProvider>
  );
};
