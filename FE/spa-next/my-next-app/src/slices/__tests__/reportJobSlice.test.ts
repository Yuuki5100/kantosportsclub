import { expect, jest } from '@jest/globals';

import reducer, {
  startJob,
  completeJob,
  failJob,
  resetJob,
} from '@slices/reportJobSlice';
import { ReportJobStatus } from '@/types/reportJob';

describe('reportJobSlice', () => {
  const initialState = {
    jobId: null,
    status: null,
    downloadUrl: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle startJob', () => {
    const action = startJob('job-123');
    const state = reducer(initialState, action);

    expect(state).toEqual({
      jobId: 'job-123',
      status: ReportJobStatus.RUNNING,
      downloadUrl: null,
    });
  });

  it('should handle completeJob', () => {
    const runningState = {
      jobId: 'job-123',
      status: ReportJobStatus.RUNNING,
      downloadUrl: null,
    };

    const action = completeJob('https://example.com/file.xlsx');
    const state = reducer(runningState, action);

    expect(state).toEqual({
      jobId: 'job-123', // jobId remains unchanged
      status: ReportJobStatus.COMPLETED,
      downloadUrl: 'https://example.com/file.xlsx',
    });
  });

  it('should handle failJob', () => {
    const runningState = {
      jobId: 'job-123',
      status: ReportJobStatus.RUNNING,
      downloadUrl: null,
    };

    const action = failJob();
    const state = reducer(runningState, action);

    expect(state).toEqual({
      jobId: 'job-123',
      status: ReportJobStatus.FAILED,
      downloadUrl: null,
    });
  });

  it('should handle resetJob', () => {
    const currentState = {
      jobId: 'job-123',
      status: ReportJobStatus.COMPLETED,
      downloadUrl: 'https://example.com/file.xlsx',
    };

    const action = resetJob();
    const state = reducer(currentState, action);

    expect(state).toEqual(initialState);
  });
});
