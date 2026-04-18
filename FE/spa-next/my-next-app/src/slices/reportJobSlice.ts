// store/slices/reportJobSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReportJobStatus } from '../types/reportJob';

type ReportJobState = {
  jobId: string | null;
  status: ReportJobStatus | null;
  downloadUrl: string | null;
};

const initialState: ReportJobState = {
  jobId: null,
  status: null,
  downloadUrl: null,
};

const reportJobSlice = createSlice({
  name: 'reportJob',
  initialState,
  reducers: {
    startJob: (state, action: PayloadAction<string>) => {
      state.jobId = action.payload;
      state.status = ReportJobStatus.RUNNING;
      state.downloadUrl = null;
    },
    completeJob: (state, action: PayloadAction<string>) => {
      state.status = ReportJobStatus.COMPLETED;
      state.downloadUrl = action.payload;
    },
    failJob: (state) => {
      state.status = ReportJobStatus.FAILED;
    },
    resetJob: (state) => {
      state.jobId = null;
      state.status = null;
      state.downloadUrl = null;
    },
  },
});

export const { startJob, completeJob, failJob, resetJob } = reportJobSlice.actions;
export default reportJobSlice.reducer;
