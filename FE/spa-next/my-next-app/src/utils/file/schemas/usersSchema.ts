import { HeaderDefinition } from "@/utils/file/types";

export const usersSchema: HeaderDefinition[] = [
  {
    field: 'id',
    required: true,
    type: 'number',
    repository: 'users',
  },
  {
    field: 'username',
    required: true,
    type: 'string',
    repository: 'users',
  },
  {
    field: 'password',
    required: true,
    type: 'string',
    repository: 'users',
  },
  {
    field: 'email',
    required: true,
    type: 'string',
    repository: 'users',
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    validationMessage: 'メールアドレスの形式が正しくありません。',
  },
  {
    field: 'role',
    required: true,
    type: 'string',
    repository: 'users',
    enumValues: ['ADMIN', 'GUEST', 'CUSTOM'],
    validationMessage: 'role は ADMIN, GUEST, CUSTOM のいずれかを指定してください。',
  },
];
