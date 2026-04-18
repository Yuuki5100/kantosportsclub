/// <reference types="jest" />

import {
  calculatePaperCheckDigit,
  calculateElectronicCheckDigit,
  validateManifestNumber
} from '../../../utils/manifest/checkDigit';
import { describe, it, expect } from '@jest/globals';

describe('CheckDigit utils', () => {
  it('calculates paper check digit correctly', () => {
    expect(calculatePaperCheckDigit('2000000003')).toBe('1');
  });

  it('calculates electronic check digit correctly', () => {
    expect(calculateElectronicCheckDigit('1100213308')).toBe('9');
  });

  it('validates correct paper manifest number', () => {
    expect(validateManifestNumber('20000000031', 'paper')).toBe(true);
  });

  it('validates correct electronic manifest number', () => {
    expect(validateManifestNumber('11002133089', 'electronic')).toBe(true);
  });

  it('passes validation with either type (null flag)', () => {
    expect(validateManifestNumber('20000000031', null)).toBe(true);
    expect(validateManifestNumber('11002133089', null)).toBe(true);
  });

  it('fails with invalid check digit', () => {
    expect(validateManifestNumber('11002133080', 'electronic')).toBe(false);
  });
});
