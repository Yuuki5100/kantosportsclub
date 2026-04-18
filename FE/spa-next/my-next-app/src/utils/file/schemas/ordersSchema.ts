import { HeaderDefinition } from '../types';

export const ordersSchema: HeaderDefinition[] = [
  {
    field: 'orderId',
    required: true,
    type: 'string',
    repository: 'orders',
  },
  {
    field: 'productName',
    required: true,
    type: 'string',
    repository: 'orders',
  },
  {
    field: 'quantity',
    required: true,
    type: 'number',
    repository: 'orders',
    pattern: (v: string) => /^\d+$/.test(v) && Number(v) > 0,
    validationMessage: '数量は 1 以上の整数で入力してください。',
  },
  {
    field: 'price',
    required: false,
    type: 'number',
    repository: 'orders',
    pattern: (v: string) => /^\d+(\.\d{1,2})?$/.test(v),
    validationMessage: '価格は小数点2桁までの数値で入力してください。',
  },
  {
    field: 'orderDate',
    required: false,
    type: 'string',
    repository: 'orders',
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    validationMessage: '注文日は YYYY-MM-DD の形式で入力してください。',
  },
];
