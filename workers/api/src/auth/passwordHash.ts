import bcrypt from 'bcryptjs';

const encoder = new TextEncoder();

const PBKDF2_ALGORITHM = 'pbkdf2-sha256';
const PBKDF2_ITERATIONS = 10_000;
const PBKDF2_SALT_BYTES = 16;
const PBKDF2_HASH_BITS = 256;

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

const bytesToHex = (bytes: Uint8Array): string =>
  [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');

const hexToBytes = (hex: string): Uint8Array | null => {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
};

const constantTimeEqual = (left: Uint8Array, right: Uint8Array): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }

  return diff === 0;
};

const derivePbkdf2Hash = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> => {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    key,
    PBKDF2_HASH_BITS,
  );

  return new Uint8Array(bits);
};

export const hashPassword = async (plainPassword: string): Promise<string> => {
  const salt = new Uint8Array(PBKDF2_SALT_BYTES);
  crypto.getRandomValues(salt);

  const hash = await derivePbkdf2Hash(plainPassword, salt, PBKDF2_ITERATIONS);

  return [
    PBKDF2_ALGORITHM,
    String(PBKDF2_ITERATIONS),
    bytesToHex(salt),
    bytesToHex(hash),
  ].join('$');
};

const verifyPbkdf2Password = async (
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> => {
  const [algorithm, iterationsText, saltHex, hashHex] = passwordHash.split('$');
  if (algorithm !== PBKDF2_ALGORITHM || !iterationsText || !saltHex || !hashHex) {
    return false;
  }

  const iterations = Number(iterationsText);
  const salt = hexToBytes(saltHex);
  const expectedHash = hexToBytes(hashHex);

  if (!Number.isInteger(iterations) || iterations <= 0 || !salt || !expectedHash) {
    return false;
  }

  const actualHash = await derivePbkdf2Hash(plainPassword, salt, iterations);
  return constantTimeEqual(actualHash, expectedHash);
};

export const isPasswordHashUpgradeRequired = (
  passwordHash: string | null | undefined,
): boolean => {
  if (!passwordHash) {
    return false;
  }

  return !passwordHash.startsWith(`${PBKDF2_ALGORITHM}$${PBKDF2_ITERATIONS}$`);
};

export const verifyPasswordHash = async (
  plainPassword: string,
  passwordHash: string | null,
): Promise<boolean> => {
  if (!passwordHash) {
    return false;
  }

  try {
    if (passwordHash.startsWith(`${PBKDF2_ALGORITHM}$`)) {
      return await verifyPbkdf2Password(plainPassword, passwordHash);
    }

    if (BCRYPT_HASH_PATTERN.test(passwordHash)) {
      return await bcrypt.compare(plainPassword, passwordHash);
    }

    return false;
  } catch {
    return false;
  }
};
