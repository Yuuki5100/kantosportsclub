import { RegisterStatus } from '@/types/CRJ/RegisterStatus';

export const RegisterStatusNames: Record<RegisterStatus, string> = {
  'new': '',
  'register': '申請中',
  'registerRemoved': '申請取下',
  'deleted': '削除',
  'reject': '差戻',
  'approved': '承認済',
  'requestingDeletion': '削除申請中',
  'deleteApprove': '承認済削除',
  'approveRemoved': '承認取下'
};
