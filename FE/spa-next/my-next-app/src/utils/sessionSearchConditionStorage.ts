export const readSessionSearchCondition = <T>(
  key: string,
  isValid: (value: unknown) => value is T
): T | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.sessionStorage.getItem(key);
    if (!stored) {
      return null;
    }

    const parsed: unknown = JSON.parse(stored);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveSessionSearchCondition = <T>(key: string, condition: T): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(condition));
  } catch {
    // sessionStorage may be unavailable in private browsing or restricted contexts.
  }
};

export const removeSessionSearchCondition = (key: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // sessionStorage may be unavailable in private browsing or restricted contexts.
  }
};
