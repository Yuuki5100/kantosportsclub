import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import AutoCompleteMultiSelected from '@/components/base/Input/AutoCompleteMultiSelected';

describe('AutoCompleteMultiSelected コンポーネント', () => {
  const options = [
    { label: '選択肢1', value: 'option1' },
    { label: '選択肢2', value: 'option2' },
    { label: '選択肢3', value: 'option3' },
  ];

  it('初期選択値を正しく表示する', () => {
    render(
      <AutoCompleteMultiSelected
        name="test"
        options={options}
        defaultValue={['option1', 'option3']}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getByText('選択肢1')).toBeInTheDocument();
    expect(screen.getByText('選択肢3')).toBeInTheDocument();
  });

  it('allowCustomValues=true のとき、カスタム入力を追加できる', async () => {
    const mockOnChange = jest.fn();

    render(
      <AutoCompleteMultiSelected
        name="test"
        options={options}
        allowCustomValues={true}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'カスタム値' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(await screen.findByText('カスタム値')).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledWith([
      { label: 'カスタム値', value: 'カスタム値' },
    ]);
  });

  it('選択変更時に onChange が呼ばれる', () => {
    const mockOnChange = jest.fn();

    render(
      <AutoCompleteMultiSelected
        name="test"
        options={options}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.mouseDown(input);
    const option = screen.getByText('選択肢2');
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith([
      { label: '選択肢2', value: 'option2' },
    ]);
  });

  it('disabled=true の場合、入力不可になる', () => {
    render(
      <AutoCompleteMultiSelected
        name="test"
        options={options}
        disabled={true}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  it('helperText や error が表示される', () => {
    render(
      <AutoCompleteMultiSelected
        name="test"
        options={options}
        helperText="エラーがあります"
        error={true}
      />
    );

    expect(screen.getByText('エラーがあります')).toBeInTheDocument();
  });
});
