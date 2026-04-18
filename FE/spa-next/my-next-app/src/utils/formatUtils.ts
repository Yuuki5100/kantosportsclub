export const formatTimestamp = (str?: string): string =>
  str ? str.replace('T', ' ').substring(0, 19) : '';
