export const includesIgnoreCase = (value: string, keyword?: string): boolean => {
  if (!keyword) return true;
  return value.toLowerCase().includes(keyword.toLowerCase());
};

