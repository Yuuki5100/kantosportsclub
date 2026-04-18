import { expect } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TooltipWrapper } from '@/components/base/utils';
import '@testing-library/jest-dom';

describe('TooltipWrapper', () => {
  it('ツールチップのタイトルが提供された場合、Tooltipコンポーネントを正しくレンダリングすること', () => {
    const testTitle = 'テストツールチップ';
    const testId = 'test-component';

    render(
      <TooltipWrapper title={testTitle}>
        <div data-testid={testId}>テストコンテンツ</div>
      </TooltipWrapper>
    );

    // 子コンポーネントがレンダリングされていることを確認
    expect(screen.getByTestId(testId)).toBeInTheDocument();

    // ツールチップがレンダリングされていることを確認
    // aria-label属性を使用してツールチップ要素を検索
    const tooltip = screen.getByLabelText(testTitle);
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute('data-mui-internal-clone-element', 'true');
  });

  it('ツールチップのタイトルが提供されない場合、子コンポーネントのみをレンダリングすること', () => {
    const testId = 'test-component';

    render(
      <TooltipWrapper title={''}>
        <div data-testid={testId}>テストコンテンツ</div>
      </TooltipWrapper>
    );

    // 子コンポーネントがレンダリングされていることを確認
    expect(screen.getByTestId(testId)).toBeInTheDocument();

    // ツールチップがレンダリングされていないことを確認
    expect(screen.queryByLabelText('')).not.toBeInTheDocument();
  });

  it('デフォルトのプロパティが正しく適用されること', () => {
    const testTitle = 'テストツールチップ';
    const testId = 'test-component';

    render(
      <TooltipWrapper title={testTitle}>
        <div data-testid={testId}>テストコンテンツ</div>
      </TooltipWrapper>
    );

    const tooltipElement = screen.getByLabelText(testTitle);
    expect(tooltipElement).toBeInTheDocument();
  });

  it('カスタムプロパティが正しく適用されること', () => {
    const testTitle = 'テストツールチップ';
    const testId = 'test-component';

    render(
      <TooltipWrapper
        title={testTitle}
        arrow={false}
        placement="bottom"
        enterDelay={500}
      >
        <div data-testid={testId}>テストコンテンツ</div>
      </TooltipWrapper>
    );

    const tooltipElement = screen.getByLabelText(testTitle);
    expect(tooltipElement).toBeInTheDocument();
  });
});
