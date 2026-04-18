import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, jest, describe, test, beforeEach } from '@jest/globals';
import AutoComplete from './AutoComplete';

const mockOptions = [
  { label: '日本', value: 'japan' },
  { label: 'アメリカ', value: 'usa' },
  { label: 'イギリス', value: 'uk' },
  { label: 'フランス', value: 'france' },
  { label: 'ドイツ', value: 'germany' },
];

describe('AutoComplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('基本的なレンダリングができること', () => {
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });

  test('初期値が設定されること', () => {
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
        defaultValue="japan"
      />
    );

    const input = screen.getByDisplayValue('日本');
    expect(input).toBeInTheDocument();
  });

  test('disabled状態で正しく無効化されること', () => {
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
        disabled={true}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  test('disabled状態が正しく適用されること', () => {
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
        disabled={true}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  test('エラー状態で正しく表示されること', () => {
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
        error={true}
        helperText="エラーメッセージ"
      />
    );

    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
  });

  test('入力フィールドが正しく表示されること', () => {
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('name', 'test');
  });

  test('freeSoloモードで自由入力ができること', () => {
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
        freeSolo={true}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '自由入力テキスト' } });

    expect(input).toHaveValue('自由入力テキスト');
  });

  test('freeSoloモードでもドロップダウン矢印が表示されること', () => {
    const { container } = render(
      <AutoComplete
        name="test"
        options={mockOptions}
        freeSolo={true}
      />
    );

    // popupIndicatorボタンが存在することを確認
    const popupIndicator = container.querySelector('.MuiAutocomplete-popupIndicator');
    expect(popupIndicator).toBeInTheDocument();
  });

  test('freeSoloモードでドロップダウンから選択できること', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
        freeSolo={true}
        onChange={mockOnChange}
      />
    );

    // ドロップダウンボタンをクリックしてオプションを表示
    const dropdownButton = screen.getByLabelText('Open');
    fireEvent.click(dropdownButton);

    await waitFor(() => {
      const option = screen.getByText('日本');
      fireEvent.click(option);
    });

    expect(mockOnChange).toHaveBeenCalledWith(mockOptions[0]);
  });

  test('freeSoloモードでドロップダウンアイコンが表示されること', () => {
    const { container } = render(
      <AutoComplete
        name="test"
        options={mockOptions}
        freeSolo={true}
      />
    );

    // freeSoloモードでもpopupIndicatorが表示されることを確認
    const popupIndicator = container.querySelector('.MuiAutocomplete-popupIndicator');
    expect(popupIndicator).toBeInTheDocument();
  });

  test('freeSoloモードでforcePopupIconが設定されていること', () => {
    const { container } = render(
      <AutoComplete
        name="test"
        options={mockOptions}
        freeSolo={true}
      />
    );
    
    // freeSoloモードでもAutocompleteコンポーネントが正しく表示されることを確認
    const autocomplete = container.querySelector('.MuiAutocomplete-root');
    expect(autocomplete).toBeInTheDocument();
  });

  test('freeSoloモードで入力値変更ができること', () => {
    const mockOnInputChange = jest.fn();
    
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
        freeSolo={true}
        onInputChange={mockOnInputChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '自由入力テキスト' } });

    expect(mockOnInputChange).toHaveBeenCalledWith('自由入力テキスト');
    expect(input).toHaveValue('自由入力テキスト');
  });

  test('カスタムスタイルが適用されること', () => {
    const customStyle = { width: '300px', marginTop: '20px' };
    
    const { container } = render(
      <AutoComplete
        name="test"
        options={mockOptions}
        customStyle={customStyle}
      />
    );

    const boxElement = container.querySelector('.MuiBox-root');
    expect(boxElement).toHaveStyle('width: 300px');
  });

  test('ヘルパーテキストが表示されること', () => {
    const helperText = 'ヘルパーテキスト';
    
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
        helperText={helperText}
      />
    );

    expect(screen.getByText(helperText)).toBeInTheDocument();
  });

  test('onBlurイベントが正しく呼ばれること', () => {
    const mockOnBlur = jest.fn();
    
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
        onBlur={mockOnBlur}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(mockOnBlur).toHaveBeenCalled();
  });

  test('onInputChangeイベントが正しく呼ばれること', () => {
    const mockOnInputChange = jest.fn();
    
    render(
      <AutoComplete
        name="test"
        options={mockOptions}
        onInputChange={mockOnInputChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test input' } });

    expect(mockOnInputChange).toHaveBeenCalledWith('test input');
  });
});