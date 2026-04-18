export type CRJApiResponse<T> = {
  result: 'Success' | 'Failed';
  message: string;
  args: string;
  data: T | null;
}
