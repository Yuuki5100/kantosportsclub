import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TextArea from '../TextBoxMultiLine';

describe('TextArea Component', () => {

  // -----------------------------
  // 基本レンダリングのテスト
  // -----------------------------
  describe('Basic Rendering', () => {
    test('コンポーネントが正常にレンダリングされること', () => {
      render(<TextArea name="test-textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('name', 'test-textarea');
    });

    test('idが正しく設定されること', () => {
      render(<TextArea name="test-textarea" id="custom-id" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'custom-id');
    });

    test('デフォルト値が表示されること', () => {
      const defaultValue = 'デフォルトテキスト';
      render(<TextArea name="test-textarea" defaultValue={defaultValue} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(defaultValue);
    });

    test('制御コンポーネントとして動作すること', () => {
      const value = 'コントロール値';
      render(<TextArea name="test-textarea" value={value} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(value);
    });
  });

  // -----------------------------
  // 入力とイベントのテスト
  // -----------------------------
  describe('Input and Event Handling', () => {
    test('テキスト入力が正常に動作すること', async () => {
      const user = userEvent.setup();
      render(<TextArea name="test-textarea" />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'テスト入力');
      expect(textarea).toHaveValue('テスト入力');
    });

    test('onChangeが正しく呼び出されること', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<TextArea name="test-textarea" onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'a');
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: 'a' }),
        })
      );
    });

    test('onBlurが正しく呼び出されること', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();
      render(<TextArea name="test-textarea" onBlur={handleBlur} />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      fireEvent.blur(textarea);

      expect(handleBlur).toHaveBeenCalled();
    });

    test('複数行の入力が正常に動作すること', async () => {
      const user = userEvent.setup();
      render(<TextArea name="test-textarea" />);
      const textarea = screen.getByRole('textbox');

      const multilineText = '1行目\n2行目\n3行目';
      await user.type(textarea, multilineText);
      expect(textarea).toHaveValue(multilineText);
    });
  });

  // -----------------------------
  // 文字数制限のテスト
  // -----------------------------
  describe('Character Limit', () => {
    test('maxLengthが設定されている場合、制限を超える入力はblur後に切り詰められる', async () => {
      const user = userEvent.setup();
      const maxLength = 10;
      render(<TextArea name="test-textarea" maxLength={maxLength} />);
      const textarea = screen.getByRole('textbox');

      const longText = '1234567890123456789';
      await user.type(textarea, longText);

      fireEvent.blur(textarea);
      await waitFor(() => {
        expect(textarea).toHaveValue(longText.slice(0, maxLength));
      });
    });

    test('maxLengthありの場合、文字数カウンターが正しく表示されること', () => {
      const maxLength = 100;
      const defaultValue = 'テスト文字列';
      render(<TextArea name="test-textarea" maxLength={maxLength} defaultValue={defaultValue} />);
      expect(screen.getByText(`${defaultValue.length} / ${maxLength}`)).toBeInTheDocument();
    });

    test('maxLengthなしの場合、文字数のみ表示されること', () => {
      const defaultValue = 'テスト文字列';
      render(<TextArea name="test-textarea" defaultValue={defaultValue} />);
      expect(screen.getByText(`${defaultValue.length} 文字`)).toBeInTheDocument();
    });

    test('maxLengthがundefinedの場合、制限なしで入力できること', async () => {
      render(<TextArea name="test-textarea" />);
      const textarea = screen.getByRole('textbox');

      const longText = '1234567890'.repeat(10);
      fireEvent.change(textarea, { target: { value: longText } });

      fireEvent.blur(textarea);
      await waitFor(() => {
        expect(textarea).toHaveValue(longText);
      });
    });
  });

  // -----------------------------
  // 制御/非制御コンポーネントのテスト
  // -----------------------------
  describe('Controlled vs Uncontrolled', () => {
    test('制御コンポーネントとして正しく動作すること', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('初期値');
        return <TextArea name="test-textarea" value={value} onChange={e => setValue(e.target.value)} />;
      };
      render(<TestComponent />);
      const textarea = screen.getByRole('textbox');

      fireEvent.change(textarea, { target: { value: '新しい値' } });
      fireEvent.blur(textarea);

      await waitFor(() => {
        expect(textarea).toHaveValue('新しい値');
      });
    });

    test('非制御コンポーネントとして正しく動作すること', async () => {
      const user = userEvent.setup();
      render(<TextArea name="test-textarea" defaultValue="デフォルト値" />);
      const textarea = screen.getByRole('textbox');

      await user.clear(textarea);
      await user.type(textarea, '入力された値');
      fireEvent.blur(textarea);

      await waitFor(() => {
        expect(textarea).toHaveValue('入力された値');
      });
    });
  });

  // -----------------------------
  // 状態（disabled, error）のテスト
  // -----------------------------
  describe('Component States', () => {
    test('disabledプロパティが正しく適用されること', () => {
      render(<TextArea name="test-textarea" disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    test('disabled状態で入力ができないこと', async () => {
      const user = userEvent.setup();
      render(<TextArea name="test-textarea" disabled defaultValue="初期値" />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'テスト');
      expect(textarea).toHaveValue('初期値');
    });

    test('errorプロパティが正しく適用されること', () => {
      render(<TextArea name="test-textarea" error />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });

  // -----------------------------
  // ヘルパーテキストのテスト
  // -----------------------------
  describe('Helper Text', () => {
    test('helperTextが正しく表示されること', () => {
      const helperText = 'これはヘルパーテキストです';
      render(<TextArea name="test-textarea" helperText={helperText} />);
      expect(screen.getByText(helperText)).toBeInTheDocument();
    });
  });

  // -----------------------------
  // カスタマイズのテスト
  // -----------------------------
  describe('Customization', () => {
    test('カスタム幅が正しく適用されること', () => {
      const customWidth = '600px';
      const { container } = render(<TextArea name="test-textarea" width={customWidth} />);
      const outerBox = container.firstChild as HTMLElement;
      expect(outerBox).toHaveStyle({ width: customWidth });
    });

    test('カスタム行数が正しく適用されること', () => {
      const customRows = 8;
      render(<TextArea name="test-textarea" rows={customRows} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', customRows.toString());
    });
  });

  // -----------------------------
  // Edge Cases
  // -----------------------------
  describe('Edge Cases', () => {
    test('空の文字列が正しく処理されること', () => {
      render(<TextArea name="test-textarea" value="" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
      expect(screen.getByText('0 文字')).toBeInTheDocument();
    });

    test('maxLengthが0の場合の動作', async () => {
      const user = userEvent.setup();
      render(<TextArea name="test-textarea" maxLength={0} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'テスト');
      fireEvent.blur(textarea);

      await waitFor(() => {
        expect(textarea).toHaveValue('');
        expect(screen.getByText('0 / 0')).toBeInTheDocument();
      });
    });

    test('非常に長いテキストの処理', async () => {
      const user = userEvent.setup();
      const longText = 'あ'.repeat(1000);
      render(<TextArea name="test-textarea" />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.paste(longText);
      fireEvent.blur(textarea);

      await waitFor(() => {
        expect(textarea).toHaveValue(longText);
        expect(screen.getByText(`${longText.length} 文字`)).toBeInTheDocument();
      });
    });
  });

});
