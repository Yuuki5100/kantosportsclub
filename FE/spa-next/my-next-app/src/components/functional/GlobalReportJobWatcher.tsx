// src/components/GlobalReportJobWatcher.tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { completeJob, failJob } from '@slices/reportJobSlice';
import { useReportPollingStatus } from '@/api/services/v1/reportService';

/**
 * グローバルにジョブステータスを監視し、完了後にダウンロードURLをReduxに反映する常駐コンポーネント
 */
const GlobalReportJobWatcher = () => {
  const dispatch = useAppDispatch();
  const { jobId, status } = useAppSelector((state: RootState) => state.reportJob);

  const isPollingEnabled = !!jobId && status === 'RUNNING';

  const { data } = useReportPollingStatus(jobId, isPollingEnabled);

  useEffect(() => {
    if (!data) return;

    const { status: jobStatus, url } = data.data;

    if (jobStatus === 'COMPLETED') {
      dispatch(completeJob(url ?? ''));
    } else if (jobStatus === 'FAILED') {
      dispatch(failJob());
    }
  }, [data, dispatch]);

  return null; // 画面には何も表示しない常駐コンポーネント
};

export default GlobalReportJobWatcher;
