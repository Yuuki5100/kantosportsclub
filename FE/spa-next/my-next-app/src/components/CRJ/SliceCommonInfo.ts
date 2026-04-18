import { CommonInfo } from '@/types/CRJ/CommonInfo';

export const SliceCommonInfo = <T extends CommonInfo>(data: T): CommonInfo => {
  return {
    id: data.id,
    registerStatus: data.registerStatus,
    deleteFlg: data.deleteFlg,
    deleteReason: data.deleteReason,
    createdAt: data.createdAt,
    createdBy: data.createdBy,
    updatedAt: data.updatedAt,
    updatedBy: data.updatedBy,
  };
};


