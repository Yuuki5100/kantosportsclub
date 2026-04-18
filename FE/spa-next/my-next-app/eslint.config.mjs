import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

import jest from "eslint-plugin-jest";
import testingLibrary from "eslint-plugin-testing-library";
import jestDom from "eslint-plugin-jest-dom";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // ⛔️ 無視対象
  {
    ignores: [
      "**/node_modules/**",
      ".next/**",
      "dist/**",
      "coverage/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
      "out/**",                 // ← 追加: outディレクトリを無視
      "next-env.d.ts",
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.stories.tsx',
      '.storybook/**',
    ],
  },

  // ✅ Next.js + TypeScript 基本設定
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ 通常コード向けルール
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name='Error'][arguments.0.type='Literal']",
          message: "生文字列のエラーメッセージは MessageIds を利用してください（getMessage）。",
        },
        {
          selector: "NewExpression[callee.name='Error'][arguments.0.type='TemplateLiteral']",
          message: "生文字列のエラーメッセージは MessageIds を利用してください（getMessage）。",
        },
        {
          selector: "CallExpression[callee.name='handleApiError'][arguments.1.type='Literal']",
          message: "handleApiError の fallback は MessageIds を利用してください（getMessage）。",
        },
        {
          selector: "CallExpression[callee.name='handleApiError'][arguments.1.type='TemplateLiteral']",
          message: "handleApiError の fallback は MessageIds を利用してください（getMessage）。",
        },
        {
          selector: "CallExpression[callee.name='showError'][arguments.0.type='Literal']",
          message: "showError のメッセージは MessageIds を利用してください（getMessage）。",
        },
        {
          selector: "CallExpression[callee.name='showError'][arguments.0.type='TemplateLiteral']",
          message: "showError のメッセージは MessageIds を利用してください（getMessage）。",
        },
        {
          selector: "CallExpression[callee.name='showSnackbar'][arguments.0.type='Literal'][arguments.1.value='ERROR']",
          message: "ERROR/ALERT のメッセージは MessageIds を利用してください（getMessage）。",
        },
        {
          selector: "CallExpression[callee.name='showSnackbar'][arguments.0.type='Literal'][arguments.1.value='ALERT']",
          message: "ERROR/ALERT のメッセージは MessageIds を利用してください（getMessage）。",
        },
        {
          selector: "CallExpression[callee.name='showSnackbar'][arguments.0.type='TemplateLiteral'][arguments.1.value='ERROR']",
          message: "ERROR/ALERT のメッセージは MessageIds を利用してください（getMessage）。",
        },
        {
          selector: "CallExpression[callee.name='showSnackbar'][arguments.0.type='TemplateLiteral'][arguments.1.value='ALERT']",
          message: "ERROR/ALERT のメッセージは MessageIds を利用してください（getMessage）。",
        },
      ],
    },
  },

  // ✅ テスト用ルールセット（pluginはオブジェクト形式で渡す）
  {
    files: ["**/__tests__/**/*.{ts,tsx}", "**/?(*.)+(spec|test).{ts,tsx}"],
    plugins: {
      jest,
      "testing-library": testingLibrary,
      "jest-dom": jestDom,
    },
    rules: {
      "jest/expect-expect": "warn",
      "testing-library/no-unnecessary-act": "warn",
      "jest-dom/prefer-checked": "warn",
      "no-console": "off",
    },
  },
  {
    files: ["**/tests/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];
