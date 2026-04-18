// src/components/__tests__/GlobalReportJobWatcher.test.tsx
import { render } from '@testing-library/react';
import GlobalReportJobWatcher from '../GlobalReportJobWatcher';
import { useDispatch, useSelector } from 'react-redux';
import { completeJob, failJob } from '@slices/reportJobSlice';
import { useReportPollingStatus } from '@/api/services/v1/reportService';

jest.mock('react-redux');
jest.mock('@slices/reportJobSlice');
jest.mock('@/api/services/v1/reportService');

describe('GlobalReportJobWatcher コンポーネント', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('ジョブがCOMPLETEDの場合、completeJobがdispatchされる', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ jobId: 'job1', status: 'RUNNING' });
    (useReportPollingStatus as jest.Mock).mockReturnValue({
      data: { data: { status: 'COMPLETED', url: 'https://example.com/report.csv' } },
    });

    render(<GlobalReportJobWatcher />);

    expect(mockDispatch).toHaveBeenCalledWith(completeJob('https://example.com/report.csv'));
  });

  it('ジョブがFAILEDの場合、failJobがdispatchされる', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ jobId: 'job1', status: 'RUNNING' });
    (useReportPollingStatus as jest.Mock).mockReturnValue({
      data: { data: { status: 'FAILED' } },
    });

    render(<GlobalReportJobWatcher />);

    expect(mockDispatch).toHaveBeenCalledWith(failJob());
  });

  it('ジョブがRUNNINGだがdataがまだない場合、dispatchは呼ばれない', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ jobId: 'job1', status: 'RUNNING' });
    (useReportPollingStatus as jest.Mock).mockReturnValue({ data: null });

    render(<GlobalReportJobWatcher />);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('jobIdがない場合、dispatchは呼ばれない', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ jobId: null, status: 'RUNNING' });
    (useReportPollingStatus as jest.Mock).mockReturnValue({ data: null });

    render(<GlobalReportJobWatcher />);

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
