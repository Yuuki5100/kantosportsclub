export const CRJ_API_ENDPOINTS = {
  COMMON: {
    APPROVERS: '/common/getApproverList',
    BASECOMBOLIST: '/common/base-combo-list',
  },
  MASTER: {
    USER: '/master/getUserMasterList',
    BATCH_TYPE_LIST: '/system-transfer/batch-list/names',
  }
};

type CRJ_API_ENDPOINTS = typeof CRJ_API_ENDPOINTS;
