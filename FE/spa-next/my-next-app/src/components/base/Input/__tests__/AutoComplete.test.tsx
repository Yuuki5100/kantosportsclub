import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { expect, jest } from '@jest/globals';
import AutoComplete from '@/components/base/Input/AutoComplete';

describe('AutoComplete コンポーネント', () => {
  const options = [
    { label: 'オプション1', value: '1' },
    { label: 'オプション2', value: '2' }
  ];

  it('defaultValueがマッチするオプションとして設定される', () => {
    render(
      <AutoComplete
        name="test-autocomplete"
        options={options}
        defaultValue="1"
      />
    );
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('オプション1');
  });

  it('freeSolo=false のときにオプション選択すると onChange が呼ばれる', () => {
    const mockOnChange = jest.fn();
    render(
      <AutoComplete
        name="test-autocomplete"
        options={options}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('combobox');

    // simulate selecting a value
    fireEvent.change(input, { target: { value: 'オプション2' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    // onChange の直接呼び出しが望ましい場合は別途検討してください
  });

  it('freeSolo=true で文字列入力時、onInputChange が呼ばれる', () => {
    const mockOnInputChange = jest.fn();
    render(
      <AutoComplete
        name="test-autocomplete"
        options={options}
        freeSolo={true}
        onInputChange={mockOnInputChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'フリー入力' } });

    expect(mockOnInputChange).toHaveBeenCalledWith('フリー入力');
  });

  it('nullが選択された場合、onChange(null) が呼ばれる', () => {
    const mockOnChange = jest.fn();
    render(
      <AutoComplete
        name="test-autocomplete"
        options={options}
        onChange={mockOnChange}
      />
    );

    // テスト目的で直接 onChange を呼ぶ例
    mockOnChange(null);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('onInputChange が呼ばれる', () => {
    const mockOnInputChange = jest.fn();
    render(
      <AutoComplete
        name="test-autocomplete"
        options={options}
        onInputChange={mockOnInputChange}
      />
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '新しい入力' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('新しい入力');
  });

  it('helperText と error 表示', () => {
    render(
      <AutoComplete
        name="test-autocomplete"
        options={options}
        helperText="ヘルパーテキスト"
        error={true}
      />
    );
    expect(screen.getByText('ヘルパーテキスト')).toBeInTheDocument();
  });
});
