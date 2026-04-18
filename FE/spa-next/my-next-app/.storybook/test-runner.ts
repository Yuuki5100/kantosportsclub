import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  setup() {
    // テスト実行前のセットアップ
  },
  async preVisit(page, context) {
    // ページ訪問前のセットアップ
    await page.waitForLoadState('networkidle');
  },
  async postVisit(page, context) {
    // ページ訪問後のテスト実行
    const elementHandler = await page.$('[data-test-has-loaded]');
    const loaded = await elementHandler?.isVisible();
    if (!loaded) {
      throw new Error('Story did not load within the expected time');
    }
  },
  tags: {
    // 特定のタグを持つストーリーのみテスト実行
    include: ['test'],
    exclude: ['docs'],
    skip: ['skip-tests'],
  },
};

export default config;