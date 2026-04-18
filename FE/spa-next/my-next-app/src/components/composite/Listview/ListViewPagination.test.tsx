// filepath: c:\source\common-archetecture\FE\spa-next\my-next-app\src\components\composite\Listview\ListViewPagination.test.tsx
import React from 'react';
import { expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListViewPagination from './ListViewPagination';
import { SortParams } from './SortParams';

describe('ListViewPagination', () => {
  // テスト用のモックデータとコールバック
  const mockSortParams: SortParams = {
    sortColumn: 'id',
    sortOrder: 'asc'
  };

  const mockOnPageChange = jest.fn();
  const mockOnRowsPerPageChange = jest.fn();

  // 基本的なプロップスを設定
  const getBaseProps = (overrides = {}) => ({
    count: 100,
    page: 1,
    rowsPerPage: 10,
    onPageChange: mockOnPageChange,
    onRowsPerPageChange: mockOnRowsPerPageChange,
    searchParams: mockSortParams,
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('コンポーネントが正しく表示されること', () => {
    render(<ListViewPagination {...getBaseProps()} />);

    // 現在のページ情報が正しく表示されることを確認（日本語形式）
    expect(screen.getByText('1 - 10 件 / 全 100 件')).toBeInTheDocument();

    // 表示件数ラベルが表示されることを確認
    expect(screen.getByText('表示件数:')).toBeInTheDocument();

    // ページネーションボタンが表示されることを確認
    expect(screen.getByLabelText('最初のページ')).toBeInTheDocument();
    expect(screen.getByLabelText('前のページ')).toBeInTheDocument();
    expect(screen.getByLabelText('次のページ')).toBeInTheDocument();
    expect(screen.getByLabelText('最後のページ')).toBeInTheDocument();
  });

  test('ページ変更が正しく動作すること', () => {
    render(<ListViewPagination {...getBaseProps()} />);

    // 次のページボタンをクリック
    const nextPageButton = screen.getByLabelText('次のページ');
    fireEvent.click(nextPageButton);

    // onPageChangeが呼ばれたことを確認（ListViewPaginationは1ベース）
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
    expect(mockOnPageChange).toHaveBeenCalledWith(2, mockSortParams);
  });

  test('前のページボタンが正しく動作すること', () => {
    // 2ページ目を表示した状態でテスト
    render(<ListViewPagination {...getBaseProps({ page: 2 })} />);

    // 前のページボタンをクリック
    const prevPageButton = screen.getByLabelText('前のページ');
    fireEvent.click(prevPageButton);

    // 1ページ目に戻ることを確認
    expect(mockOnPageChange).toHaveBeenCalledWith(1, mockSortParams);
  });

  test('最初と最後のページボタンが正しく動作すること', () => {
    // 3ページ目を表示した状態でテスト
    render(<ListViewPagination {...getBaseProps({ page: 3 })} />);

    // 最初のページボタンをクリック
    const firstPageButton = screen.getByLabelText('最初のページ');
    fireEvent.click(firstPageButton);

    // 1ページ目に戻ることを確認
    expect(mockOnPageChange).toHaveBeenCalledWith(1, mockSortParams);

    // 最後のページボタンをクリック
    const lastPageButton = screen.getByLabelText('最後のページ');
    fireEvent.click(lastPageButton);

    // 最後のページに進むことを確認（100件、10件/ページなので10ページ目）
    expect(mockOnPageChange).toHaveBeenCalledWith(10, mockSortParams);
  });

  test('表示件数の変更が正しく動作すること', () => {
    render(<ListViewPagination {...getBaseProps()} />);

    // 表示件数を変更（10から20へ）
    // MUIのSelectはrole="combobox"を持つ
    const rowsPerPageSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(rowsPerPageSelect);

    // メニューが開いたら、20の選択肢をクリックする
    const option20 = screen.getByRole('option', { name: '20' });
    fireEvent.click(option20);

    // onRowsPerPageChangeが呼ばれたことを確認
    expect(mockOnRowsPerPageChange).toHaveBeenCalledTimes(1);
  });

  test('全体の件数が0の場合の表示', () => {
    render(<ListViewPagination {...getBaseProps({ count: 0 })} />);

    // データがない場合の表示を確認
    expect(screen.getByText('データなし')).toBeInTheDocument();
  });

  test('カスタム行数オプションが表示されること', () => {
    render(<ListViewPagination {...getBaseProps()} />);

    // 表示件数ドロップダウンを開く
    const rowsPerPageSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(rowsPerPageSelect);

    // オプションが正しく表示されることを確認
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(4); // 10, 20, 50, 100の4つ

    // 各オプションの値が正しいことを確認
    expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '20' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
  });

  test('hidden=trueの場合はコンポーネントが非表示になること', () => {
    const { container } = render(<ListViewPagination {...getBaseProps({ hidden: true })} />);

    // コンポーネントが何もレンダリングされないことを確認
    expect(container.firstChild).toBeNull();

    // ページネーション要素が存在しないことを確認
    expect(screen.queryByText('表示件数:')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('次のページ')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('前のページ')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  test('hidden=falseの場合はコンポーネントが表示されること', () => {
    render(<ListViewPagination {...getBaseProps({ hidden: false })} />);

    // コンポーネントが正常に表示されることを確認
    expect(screen.getByText('1 - 10 件 / 全 100 件')).toBeInTheDocument();
    expect(screen.getByText('表示件数:')).toBeInTheDocument();
    expect(screen.getByLabelText('次のページ')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('hiddenプロパティが未指定（undefined）の場合はデフォルトで表示されること', () => {
    // hiddenプロパティを明示的に設定せずにテスト
    const propsWithoutHidden = {
      count: 100,
      page: 1,
      rowsPerPage: 10,
      onPageChange: mockOnPageChange,
      onRowsPerPageChange: mockOnRowsPerPageChange,
      searchParams: mockSortParams,
    };

    render(<ListViewPagination {...propsWithoutHidden} />);

    // デフォルトで表示されることを確認
    expect(screen.getByText('1 - 10 件 / 全 100 件')).toBeInTheDocument();
    expect(screen.getByText('表示件数:')).toBeInTheDocument();
    expect(screen.getByLabelText('次のページ')).toBeInTheDocument();
  });
});
