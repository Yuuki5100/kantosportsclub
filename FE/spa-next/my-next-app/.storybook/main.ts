import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/test",
    "msw-storybook-addon"
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "typescript": {
    "reactDocgen": "react-docgen-typescript"
  },
  "staticDirs": [
    "../public"
  ]
};
export default config;