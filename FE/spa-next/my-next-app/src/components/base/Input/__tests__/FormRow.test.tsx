import { expect } from '@jest/globals';
import React from "react";
import { render, screen } from "@testing-library/react";

import FormRow from "@components/base/Input/FormRow";


describe("FormRow コンポーネント", () => {
  it("ラベルが正しく表示される", () => {
    render(
      <FormRow label="テストラベル">
        <input type="text" />
      </FormRow>
    );

    // ラベルが正しく表示されているか確認
    const label = screen.getByText("テストラベル");
    expect(label).toBeInTheDocument();
    expect(label).toHaveStyle("font-weight: 700");
  });

  it("子コンポーネントが正しくレンダリングされる", () => {
    render(
      <FormRow label="テストラベル">
        <input type="text" data-testid="test-input" />
      </FormRow>
    );

    // 子コンポーネントが正しくレンダリングされているか確認
    const input = screen.getByTestId("test-input");
    expect(input).toBeInTheDocument();
  });

  it("カスタムスタイルが適用される", () => {
    const customStyle = { backgroundColor: "red" };

    const { container } = render(
      <FormRow label="テストラベル" rowCustomStyle={customStyle}>
        <input type="text" />
      </FormRow>
    );

    // 最上位のBox（FormRow全体）を取得
    const row = container.firstChild as HTMLElement;
    expect(row).toHaveStyle("background-color: red");
  });
});
