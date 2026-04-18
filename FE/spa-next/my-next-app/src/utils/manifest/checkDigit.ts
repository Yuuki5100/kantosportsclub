// src/utils/manifest/checkDigit.ts
import { getMessage, MessageCodes } from '@/message';

export type ManifestType = 'paper' | 'electronic' | null;

export function calculatePaperCheckDigit(number10: string): string {
  const num = parseInt(number10, 10);
  if (isNaN(num)) throw new Error(getMessage(MessageCodes.MANIFEST_INVALID_NUMBER10_PAPER));
  return String(num % 7);
}

export function calculateElectronicCheckDigit(number10: string): string {
  if (!/^\d{10}$/.test(number10)) {
    throw new Error(getMessage(MessageCodes.MANIFEST_INVALID_NUMBER10_ELECTRONIC));
  }
  const sum = number10.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  return String(sum % 10);
}

export function validateManifestNumber(
  manifestNumber11: string,
  check: ManifestType
): boolean {
  if (!/^\d{11}$/.test(manifestNumber11)) {
    throw new Error(getMessage(MessageCodes.MANIFEST_INVALID_NUMBER11));
  }

  const number10 = manifestNumber11.slice(0, 10);
  const actualDigit = manifestNumber11.slice(10);

  const checkPaper = (): boolean => {
    try {
      return actualDigit === calculatePaperCheckDigit(number10);
    } catch {
      return false;
    }
  };

  const checkElectronic = (): boolean => {
    try {
      return actualDigit === calculateElectronicCheckDigit(number10);
    } catch {
      return false;
    }
  };

  switch (check) {
    case 'paper':
      return checkPaper();
    case 'electronic':
      return checkElectronic();
    case null:
      return checkPaper() || checkElectronic();
    default:
      throw new Error(getMessage(MessageCodes.MANIFEST_INVALID_CHECK_TYPE));
  }
}
