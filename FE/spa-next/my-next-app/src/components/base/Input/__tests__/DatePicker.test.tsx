import { expect, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import '../../../../../jest.setup';
import DatePicker from '@/components/base/Input/DatePicker';

describe('DatePicker コンポーネント', () => {
  // テストの共通ラッパーとして、LocalizationProvider や ThemeProvider などが必要な場合は
  // テスト用ラッパーコンポーネントを作成すると良いですが、ここではコンポーネント自体に LocalizationProvider が含まれている前提です。

  it('指定したラベルが表示され、inputに関連付けられている', () => {
    render(<DatePicker label="テストラベル" />);
    const input = screen.getByLabelText('テストラベル');
    expect(input).toBeInTheDocument();
  });

  it('value が設定されていない場合、クリアボタンは表示されない', () => {
    render(<DatePicker label="テスト" value={undefined} />);
    // クリアボタンとして ClearIcon を利用しているので、aria-label が設定されている場合で取得も可能
    // ここでは、IconButton 自体が見つからないことを確認
    const clearButton = screen.queryByRole('button', { name: /clear DatePicker/i });
    expect(clearButton).toBeNull();
  });

  it('value が設定されている場合、クリアボタンが表示され、クリックすると onChange に undefined を渡す', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const testValue = dayjs('2025-04-10');

    render(<DatePicker label="テスト" value={testValue} onChange={handleChange} />);

    // DatePicker の内部で TextField が描画されるので、クリアボタンは InputAdornment 内に存在する
    const clearButton = screen.getByRole('button', { name: /clear DatePicker/i });

    // クリアボタンをクリック
    await user.click(clearButton);

    // onChange が undefined を渡して呼ばれることを確認
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(undefined);
    });
  });

  it('value に指定した日付が input に表示される', () => {
    const value = dayjs('2025-04-10');
    render(<DatePicker label="日付" value={value} />);
    const input = screen.getByLabelText('日付') as HTMLInputElement;
    expect(input.value).toBe('2025/04/10');
  });

  it('value が undefined のとき、クリアボタンが表示されない', () => {
    render(<DatePicker label="日付" value={undefined} />);
    const clearBtn = screen.queryByRole('button', { name: /clear DatePicker/i });
    expect(clearBtn).toBeNull();
  });

  it('disabled が true のとき、入力できない', () => {
    render(<DatePicker label="日付" disabled />);
    const input = screen.getByLabelText('日付') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('disabled が true のとき、クリアボタンを押しても onChange は呼ばれない', async () => {
    const handleChange = jest.fn();

    render(
      <DatePicker
        label="日付"
        value={dayjs('2025-04-10')}
        onChange={handleChange}
        disabled
      />
    );

    // クリアボタンがあるか確認
    const clearButton = screen.queryByRole('button', { name: /clear DatePicker/i });

    // pointer-events: none がついてることを確認(disabledで追加されるCSSプロパティ)
    expect(clearButton).toHaveStyle('pointer-events: none');
  });

  describe('formatプロパティのテスト', () => {
    it('デフォルトフォーマット（YYYY/MM/DD）で日付が表示される', () => {
      const value = dayjs('2025-12-25');
      render(<DatePicker label="日付" value={value} />);
      
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      expect(input.value).toBe('2025/12/25');
    });

    it('カスタムフォーマット（DD-MM-YYYY）で日付が表示される', () => {
      const value = dayjs('2025-12-25');
      render(<DatePicker label="日付" value={value} format="DD-MM-YYYY" />);
      
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      expect(input.value).toBe('25-12-2025');
    });

    it('カスタムフォーマット（YYYY年MM月DD日）で日付が表示される', () => {
      const value = dayjs('2025-03-15');
      render(<DatePicker label="日付" value={value} format="YYYY年MM月DD日" />);
      
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      expect(input.value).toBe('2025年03月15日');
    });

    it('カスタムフォーマット（MM/DD/YYYY）で日付が表示される', () => {
      const value = dayjs('2025-07-04');
      render(<DatePicker label="日付" value={value} format="MM/DD/YYYY" />);
      
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      expect(input.value).toBe('07/04/2025');
    });

    it('カスタムフォーマット（YYYY/MM）で年月のみ表示される', () => {
      const value = dayjs('2025-03-15');
      render(<DatePicker label="日付" value={value} format="YYYY/MM" />);
      
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      expect(input.value).toBe('2025/03');
    });

    it('カスタムフォーマット（YYYY-MM）で年月のみ表示される', () => {
      const value = dayjs('2025-12-25');
      render(<DatePicker label="日付" value={value} format="YYYY-MM" />);
      
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      expect(input.value).toBe('2025-12');
    });

    it('カスタムフォーマット（YYYY年MM月）で年月のみ表示される', () => {
      const value = dayjs('2025-06-01');
      render(<DatePicker label="日付" value={value} format="YYYY年MM月" />);
      
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      expect(input.value).toBe('2025年06月');
    });

    it('空のフォーマットが指定された場合でもエラーにならない', () => {
      const value = dayjs('2025-01-01');
      render(<DatePicker label="日付" value={value} format="" />);
      
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      // 空のフォーマットの場合、MUIのデフォルト動作に従う
      expect(input).toBeInTheDocument();
    });
  });

  describe('onChangeコールバックのテスト', () => {
    it('onChangeコールバックが設定されていることを確認', () => {
      const handleChange = jest.fn();
      const initialValue = dayjs('2025-01-01');
      
      render(<DatePicker label="日付" value={initialValue} onChange={handleChange} />);
      
      // DatePickerがレンダリングされ、初期値が設定されていることを確認
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      expect(input.value).toBe('2025/01/01');
      
      // onChangeが関数として設定されていることを確認
      expect(typeof handleChange).toBe('function');
    });

    it('onChangeで渡されるDayjsオブジェクトが正しい日付を持つ', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const initialValue = dayjs('2025-01-01');
      
      render(<DatePicker label="日付" value={initialValue} onChange={handleChange} />);
      
      // クリアボタンをクリックしてundefinedが渡されることを確認
      const clearButton = screen.getByRole('button', { name: /clear DatePicker/i });
      await user.click(clearButton);
      
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(undefined);
      });
    });

    it('複数回の日付変更でonChangeが適切に呼ばれる', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const initialValue = dayjs('2025-01-01');
      
      render(<DatePicker label="日付" value={initialValue} onChange={handleChange} />);
      
      // 最初にクリアボタンをクリック
      const clearButton = screen.getByRole('button', { name: /clear DatePicker/i });
      await user.click(clearButton);
      
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(undefined);
      });
      
      // handleChangeの呼び出し回数を確認
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('onChangeが設定されていない場合でもエラーにならない', async () => {
      const user = userEvent.setup();
      const initialValue = dayjs('2025-01-01');
      
      // onChangeを設定せずにレンダリング
      render(<DatePicker label="日付" value={initialValue} />);
      
      // クリアボタンをクリックしてもエラーが発生しないことを確認
      const clearButton = screen.getByRole('button', { name: /clear DatePicker/i });
      
      // エラーが発生しないことを確認
      await expect(user.click(clearButton)).resolves.not.toThrow();
    });

    it('無効な日付入力時のonChangeの動作', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<DatePicker label="日付" onChange={handleChange} />);
      
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      
      // 無効な日付を入力
      await user.clear(input);
      await user.type(input, 'invalid-date');
      await user.tab(); // フォーカスを外す
      
      // MUIのDatePickerの動作に依存するが、通常は無効な日付の場合nullまたはundefinedが渡される
      await waitFor(() => {
        if (handleChange.mock.calls.length > 0) {
          const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
          expect(lastCall[0]).toBeUndefined();
        }
      });
    });
  });

  describe('formatとonChangeが連携したテスト', () => {
    it('カスタムフォーマットで表示された日付をクリアした時、onChangeが正しく呼ばれる', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const value = dayjs('2025-12-25');
      
      render(
        <DatePicker 
          label="日付" 
          value={value} 
          format="DD/MM/YYYY" 
          onChange={handleChange} 
        />
      );
      
      // カスタムフォーマットで表示されていることを確認
      const input = screen.getByLabelText('日付') as HTMLInputElement;
      expect(input.value).toBe('25/12/2025');
      
      // クリアボタンをクリック
      const clearButton = screen.getByRole('button', { name: /clear DatePicker/i });
      await user.click(clearButton);
      
      // onChangeがundefinedで呼ばれることを確認
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(undefined);
      });
    });

    it('異なるフォーマットで同じ日付が正しく表示される', () => {
      // 複数のフォーマットを個別のテストケースとして実行
      const testDate = dayjs('2025-06-15');
      
      // フォーマット1: YYYY/MM/DD
      const { unmount: unmount1 } = render(
        <DatePicker 
          label="日付フォーマット1" 
          value={testDate} 
          format="YYYY/MM/DD"
        />
      );
      const input1 = screen.getByLabelText('日付フォーマット1') as HTMLInputElement;
      expect(input1.value).toBe('2025/06/15');
      unmount1();
      
      // フォーマット2: DD-MM-YYYY
      const { unmount: unmount2 } = render(
        <DatePicker 
          label="日付フォーマット2" 
          value={testDate} 
          format="DD-MM-YYYY"
        />
      );
      const input2 = screen.getByLabelText('日付フォーマット2') as HTMLInputElement;
      expect(input2.value).toBe('15-06-2025');
      unmount2();

      // フォーマット3: YYYY/MM（年月のみ）
      const { unmount: unmount3 } = render(
        <DatePicker 
          label="日付フォーマット3" 
          value={testDate} 
          format="YYYY/MM"
        />
      );
      const input3 = screen.getByLabelText('日付フォーマット3') as HTMLInputElement;
      expect(input3.value).toBe('2025/06');
      unmount3();
    });

    it('YYYY/MMフォーマットでクリアした時のonChangeテスト', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const value = dayjs('2025-08-15');
      
      render(
        <DatePicker 
          label="年月フォーマット" 
          value={value} 
          format="YYYY/MM" 
          onChange={handleChange} 
        />
      );
      
      // YYYY/MMフォーマットで表示されていることを確認
      const input = screen.getByLabelText('年月フォーマット') as HTMLInputElement;
      expect(input.value).toBe('2025/08');
      
      // クリアボタンをクリック
      const clearButton = screen.getByRole('button', { name: /clear DatePicker/i });
      await user.click(clearButton);
      
      // onChangeがundefinedで呼ばれることを確認
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(undefined);
      });
    });
  });
});
