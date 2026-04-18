import { expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import TextBox from '../TextBox';
import '../../../../../jest.setup';

describe('TextBox Component', () => {
  // 基本的なレンダリングテスト
  test('テキストボックスが正しくレンダリングされること', () => {
    render(<TextBox name="test-input" />);
    const textboxElement = screen.getByRole('textbox');
    expect(textboxElement).toBeInTheDocument();
  });

  // プロパティのテスト
  test('nameとidプロパティが正しく適用されること', () => {
    render(<TextBox name="test-name" id="test-id" />);
    const textboxElement = screen.getByRole('textbox');
    expect(textboxElement).toHaveAttribute('name', 'test-name');
    expect(textboxElement).toHaveAttribute('id', 'test-id');
  });

  test('typeプロパティが正しく適用されること', () => {
    render(<TextBox name="test-input" type="password" />);
    // パスワードフィールドはrole="textbox"を持たないため、nameで検索
    const textboxElement = screen.getByDisplayValue('');
    expect(textboxElement).toHaveAttribute('type', 'password');
  });

  test('valueプロパティが正しく適用されること', () => {
    render(<TextBox name="test-input" value="テスト値" />);
    const textboxElement = screen.getByRole('textbox');
    expect(textboxElement).toHaveValue('テスト値');
  });

  test('disabledプロパティが正しく適用されること', () => {
    render(<TextBox name="test-input" disabled />);
    const textboxElement = screen.getByRole('textbox');
    expect(textboxElement).toBeDisabled();
  });

  // イベントハンドラのテスト
  test('onChangeイベントが正しく発火されること', async () => {
    const handleChange = jest.fn();
    render(<TextBox name="test-input" onChange={handleChange} />);

    const textboxElement = screen.getByRole('textbox');
    await userEvent.type(textboxElement, 'テスト入力');

    expect(handleChange).toHaveBeenCalledTimes(5); // 「テスト入力」は5文字
  });

  test('focusアウト後にmaxlengthで切り詰められる', async () => {
    const user = userEvent.setup();
    render(<TextBox name="test-input" maxLength={3} />);

    const textboxElement = screen.getByRole('textbox');

    // 長い文字列を入力
    await user.type(textboxElement, 'あいうえお');

    // フォーカス移動で blur を発火させる
    await user.tab();

    // 値が3文字に切り詰められることを確認
    expect(textboxElement).toHaveValue('あいう');
  });

  // ヘルパーテキストのテスト
  test('helperTextが表示されること', () => {
    render(<TextBox name="test-input" helperText="これはヘルプテキストです" />);
    expect(screen.getByText('これはヘルプテキストです')).toBeInTheDocument();
  });

  // エラー状態のテスト
  test('errorプロパティが正しく適用されること', () => {
    render(<TextBox name="test-input" error helperText="エラーメッセージ" />);
    const helperText = screen.getByText('エラーメッセージ');
    expect(helperText).toHaveClass('Mui-error');
  });

  // 単位表示のテスト
  test('unitが表示されること', () => {
    render(<TextBox name="test-input" unit="円" />);
    expect(screen.getByText('円')).toBeInTheDocument();
  });

  // クリアボタンのテスト
  test('クリアボタンが表示され、クリックで関数が呼ばれること', () => {
    const handleClear = jest.fn();
    render(
      <TextBox
        name="test-input"
        value="テスト値"
        clearButton={true}
        clearButtonOnClick={handleClear}
      />
    );

    const clearButton = screen.getByLabelText('clear text input');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  test('disabledの場合、クリアボタンが表示されないこと', () => {
    render(
      <TextBox
        name="test-input"
        value="テスト値"
        clearButton={true}
        disabled={true}
      />
    );
    const clearButton = screen.queryByLabelText('clear text input');
    expect(clearButton).not.toBeInTheDocument();
  });

  // onChangeがない場合のクリアボタンのテスト
  test('onChangeがない場合でもクリアボタンがエラーなく動作すること', () => {
    render(<TextBox name="test-input" value="テスト値" clearButton={true} />);

    const clearButton = screen.getByLabelText('clear text input');
    // エラーが発生しなければテスト成功
    expect(() => fireEvent.click(clearButton)).not.toThrow();
  });

  test('maxLengthより短い入力ではそのまま', async () => {
    const user = userEvent.setup();
    render(<TextBox name="test-input" maxLength={3} />);

    const textboxElement = screen.getByRole('textbox');

    await user.type(textboxElement, 'あい');

    await user.tab();

    expect(textboxElement).toHaveValue('あい');
  });
});
