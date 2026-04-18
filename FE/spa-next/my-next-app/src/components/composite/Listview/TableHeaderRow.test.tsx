// filepath: c:\source\common-archetecture\FE\spa-next\my-next-app\src\components\composite\Listview\TableHeaderRow.test.tsx
import React from 'react';
import { expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from '@mui/material';
import { TableHeaderRow, TableHeaderRowProps } from './TableHeaderRow';
import { ColumnDefinition } from './ListView';
import { computeColumnWidths } from './utils/columnWidthUtils'; // ★ 追加

describe('TableHeaderRow', () => {
  // テスト用のモックデータ
  const mockColumns: ColumnDefinition[] = [
    { id: 'id', label: 'ID', display: true, sortable: true },
    { id: 'name', label: '名前', display: true, sortable: true },
    { id: 'age', label: '年齢', display: true, sortable: false },
    { id: 'hidden', label: '非表示', display: false, sortable: true }
  ];

  const computedColumns = computeColumnWidths(mockColumns); // ★ widthPercent 反映

  // テスト用のmockコールバック
  const mockHandleSortChange = jest.fn();

  // 基本的なプロップスを設定
  const getBaseProps = (): TableHeaderRowProps => ({
    columns: computedColumns,
    sortParams: { sortColumn: 'id', sortOrder: 'asc' },
    handleSortChange: mockHandleSortChange
  });

  // TableHeaderRowを適切なTable構造でラップするヘルパー関数
  const renderWithTable = (props: TableHeaderRowProps) => {
    return render(
      <Table>
        <TableHeaderRow {...props} />
      </Table>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ヘッダー行が正しく表示されること', () => {
    renderWithTable(getBaseProps());

    // 表示されるヘッダーテキストをテスト
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByText('年齢')).toBeInTheDocument();

    // 非表示カラムのヘッダーが表示されないことを確認
    expect(screen.queryByText('非表示')).not.toBeInTheDocument();
  });

  test('ソート可能なカラムがクリックされたときにソートコールバックが呼ばれること', () => {
    renderWithTable(getBaseProps());

    // 名前列（ソート可能）のヘッダーをクリック
    const nameHeader = screen.getByText('名前').closest('th');
    if (nameHeader) {
      fireEvent.click(nameHeader);
    }

    // ソート変更コールバックが呼ばれることを確認
    expect(mockHandleSortChange).toHaveBeenCalledTimes(1);
    expect(mockHandleSortChange).toHaveBeenCalledWith({
      sortColumn: 'name',
      sortOrder: 'asc'
    });
  });

  test('ソート不可能なカラムがクリックされたときにソートコールバックが呼ばれないこと', () => {
    renderWithTable(getBaseProps());

    // 年齢列（ソート不可）のヘッダーをクリック
    const ageHeader = screen.getByText('年齢').closest('th');
    if (ageHeader) {
      fireEvent.click(ageHeader);
    }

    // ソート変更コールバックが呼ばれないことを確認
    expect(mockHandleSortChange).not.toHaveBeenCalled();
  });

  test('既にソートされているカラムをクリックするとソート順が変更されること', () => {
    // 'id'が既に'asc'でソートされている状態で始める
    const props = getBaseProps();
    const { rerender } = renderWithTable(props);

    // 現在ソートされている'id'カラムをクリック
    const idHeader = screen.getByText('ID').closest('th');
    if (idHeader) {
      fireEvent.click(idHeader);
    }

    // ソート順が'asc'から'desc'に変わることを確認
    expect(mockHandleSortChange).toHaveBeenCalledWith({
      sortColumn: 'id',
      sortOrder: 'desc'
    });

    // モックをリセットして、props を更新（ソート順がdescになったことをシミュレート）
    mockHandleSortChange.mockClear();
    const updatedProps: TableHeaderRowProps = {
      ...props,
      sortParams: { sortColumn: 'id', sortOrder: 'desc' }
    };

    // rerenderを使用してpropsを更新
    rerender(
      <Table>
        <TableHeaderRow {...updatedProps} />
      </Table>
    );

    // 再度'id'カラムをクリック
    const idHeaderAgain = screen.getByText('ID').closest('th');
    if (idHeaderAgain) {
      fireEvent.click(idHeaderAgain);
    }

    // ソートがオフになることを確認
    expect(mockHandleSortChange).toHaveBeenCalledWith({
      sortColumn: '',
      sortOrder: false
    });
  });
});
