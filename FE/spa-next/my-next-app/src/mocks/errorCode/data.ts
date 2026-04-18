export type MockErrorCode = {
  code: string;
  message: string;
  locale: string;
};

export const mockErrorCodes: MockErrorCode[] = [
  { code: "E0001", message: "不明なエラー", locale: "ja" },
  { code: "E0002", message: "入力エラー", locale: "ja" },
  { code: "E1001", message: "Invalid input", locale: "en" },
];

