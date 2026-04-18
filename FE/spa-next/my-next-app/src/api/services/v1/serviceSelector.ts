import { isMockMode } from "@/utils/envUtils";

export class MockNotImplementedError extends Error {
  constructor(message: string = "Mock not implemented") {
    super(message);
    this.name = "MockNotImplementedError";
  }
}

export const callWithMockFallback = async <T>(
  mockFn: () => Promise<T>,
  realFn: () => Promise<T>
): Promise<T> => {
  if (!isMockMode()) {
    return realFn();
  }
  try {
    return await mockFn();
  } catch (error) {
    if (error instanceof MockNotImplementedError) {
      return realFn();
    }
    throw error;
  }
};

export const selectHook = <Args extends unknown[], Result>(
  realHook: (...args: Args) => Result,
  mockHook?: (...args: Args) => Result
): ((...args: Args) => Result) => {
  if (isMockMode() && mockHook) {
    return mockHook;
  }
  return realHook;
};
