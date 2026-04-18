// utils/formatters.ts

/**
 * 数値を3桁カンマ区切りで整形（小数点桁数調整付き）
 */
export function formatNumber(
  rawValue: string | number,
  decimalScale: number = 2
): string {
  const num = Number(rawValue);
  if (isNaN(num)) return String(rawValue);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimalScale,
    maximumFractionDigits: decimalScale,
  });
}

/**
 * カンマや記号を除去し、数値としてパース可能な文字列に戻す
 */
export function unformatNumber(formatted: string): string {
  return formatted.replace(/[^\d.-]/g, ''); // 数値・小数・マイナス以外を削除
}

/**
 * 通貨フォーマット（prefix付き）
 */
export function formatCurrency(
  rawValue: string | number,
  prefix: string = '¥',
  decimalScale: number = 2
): string {
  return `${prefix}${formatNumber(rawValue, decimalScale)}`;
}

/**
 * パーセント表示（例: 0.123 → "12.3%"）
 */
export function formatPercent(
  rawValue: string | number,
  decimalScale: number = 1
): string {
  const num = Number(rawValue);
  if (isNaN(num)) return String(rawValue);
  return `${(num * 100).toFixed(decimalScale)}%`;
}

/**
 * 汎用フォーマットエントリーポイント
 */
export function formatValue(
  rawValue: string | number,
  format: 'number' | 'currency' | 'percent' | 'none' = 'none',
  options?: {
    prefix?: string;
    decimalScale?: number;
  }
): string {
  const { prefix = '¥', decimalScale = 2 } = options || {};

  switch (format) {
    case 'number':
      return formatNumber(rawValue, decimalScale);
    case 'currency':
      return formatCurrency(rawValue, prefix, decimalScale);
    case 'percent':
      return formatPercent(rawValue, decimalScale);
    case 'none':
    default:
      return String(rawValue ?? '');
  }
}
