/**
 * インポートやバッチ処理などのジョブ状態を表す型
 */
export interface JobStatus {
  id: number;
  jobName: string;
  status: string;
  startTime: string;
  endTime: string;
  message: string;
}
