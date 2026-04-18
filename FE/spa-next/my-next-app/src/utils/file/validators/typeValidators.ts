// utils/file/validators/typeValidators.ts
export const isValidByType = (value: string, type: 'string' | 'number' | 'boolean' | 'enum'| 'date'| 'long'): boolean => {
  if (type === 'string') return true; // 空でない文字列かは required で別チェック
  if (type === 'number') return /^-?\d+(\.\d+)?$/.test(value); // 整数 or 小数
  if (type === 'boolean') return /^(true|false|1|0)$/i.test(value);
  if (type === 'enum') return true;
  if (type === 'long') return true;
  if (type === 'date') return true;
  return false;
};
