// src/utils/file/schemas/schemaMap.ts

import { HeaderDefinition } from '../types';
import { usersSchema } from './usersSchema';
import { ordersSchema } from './ordersSchema';
import { getMessage, MessageCodes } from '@/message';

export const schemaMap: Record<string, HeaderDefinition[]> = {
  users: usersSchema,
  orders: ordersSchema,
};

export const resolveSchema = (prefix: string): HeaderDefinition[] => {
  const schema = schemaMap[prefix];
  if (!schema) {
    throw new Error(getMessage(MessageCodes.UNSUPPORTED_FILE_TYPE, prefix));
  }
  return schema;
};
