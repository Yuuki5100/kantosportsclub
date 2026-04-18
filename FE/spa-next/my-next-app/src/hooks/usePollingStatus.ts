// hooks/usePollingStatus.ts
import { useFetch } from '@/hooks/useApi';

export type JobStatusResponse = {
  data: {
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
    url?: string;
  }
};

export const usePollingStatus = (
  endPoint: string,
  jobId: string | null,
  enabled: boolean,
) => {
  const url = jobId ? `${endPoint}/${jobId}` : '';
  return useFetch<JobStatusResponse>(
    `pollingStatus-${jobId}-${enabled? "TRUE":"FALSE"}`,
    url,
    undefined,
    {
      enabled: enabled && !!jobId,
      refetchInterval: enabled? 1000 : false
    }
  );
};
