export const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCK_MODE === "true";
};

