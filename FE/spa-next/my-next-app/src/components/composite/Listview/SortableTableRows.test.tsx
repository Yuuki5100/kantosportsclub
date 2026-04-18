// filepath: c:\source\common-archetecture\FE\spa-next\my-next-app\src\components\composite\Listview\SortableTableRows.test.tsx
import { expect } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SortableTableRows, SortableTableRowsProps } from './SortableTableRows';
import { ColumnDefinition, RowDefinition } from './ListView';
import { computeColumnWidths } from './utils/columnWidthUtils';

describe('SortableTableRows', () => {
  // テスト用のモックデータ
  const mockColumns: ColumnDefinition[] = [
    { id: 'id', label: 'ID', display: true, sortable: true },
    { id: 'name', label: '名前', display: true, sortable: true },
    { id: 'age', label: '年齢', display: true, sortable: true },
    { id: 'hidden', label: '非表示', display: false, sortable: false }
  ];

  const mockRowData: RowDefinition[] = [
    {
      cells: [
        { id: 'row1-id', columnId: 'id', cell: '1', value: '1' },
        { id: 'row1-name', columnId: 'name', cell: 'Tanaka', value: 'Tanaka' },
        { id: 'row1-age', columnId: 'age', cell: '30', value: 30 },
        { id: 'row1-hidden', columnId: 'hidden', cell: '非表示データ1', value: 'hidden1' }
      ],
    },
    {
      cells: [
        { id: 'row2-id', columnId: 'id', cell: '2', value: '2' },
        { id: 'row2-name', columnId: 'name', cell: 'Suzuki', value: 'Suzuki' },
        { id: 'row2-age', columnId: 'age', cell: '25', value: 25 },
        { id: 'row2-hidden', columnId: 'hidden', cell: '非表示データ2', value: 'hidden2' }
      ],
    },
    {
      cells: [
        { id: 'row3-id', columnId: 'id', cell: '3', value: '3' },
        { id: 'row3-name', columnId: 'name', cell: 'Sato', value: 'Sato' },
        { id: 'row3-age', columnId: 'age', cell: '40', value: 40 },
        { id: 'row3-hidden', columnId: 'hidden', cell: '非表示データ3', value: 'hidden3' }
      ],
    },
    {
      cells: [
        { id: 'row4-id', columnId: 'id', cell: '4', value: '4' },
        { id: 'row4-name', columnId: 'name', cell: 'Ito', value: 'Ito' },
        { id: 'row4-age', columnId: 'age', cell: '35', value: 35 },
        { id: 'row4-hidden', columnId: 'hidden', cell: '非表示データ4', value: 'hidden4' }
      ],
    }
  ];
  const computedColumns = computeColumnWidths(mockColumns);

  // 基本的なpropsを設定
const getBaseProps = (overrides = {}): SortableTableRowsProps => ({
  sortParams: { sortColumn: 'id', sortOrder: 'asc' },
  rowData: mockRowData,
  columnDefinition: computedColumns,
  page: 1,
  rowsPerPage: 2,
  ...overrides
});



  test('行が正しく表示されること', () => {
    // 1ページ目のデータのみ渡す（rowsPerPage: 2なので最初の2件）
    const firstPageData = mockRowData.slice(0, 2);
    const props = getBaseProps({ rowData: firstPageData });

    render(
      <table>
        <SortableTableRows {...props} />
      </table>
    );

    // 最初のページの行データが表示される
    expect(screen.getByText('Tanaka')).toBeInTheDocument();
    expect(screen.getByText('Suzuki')).toBeInTheDocument();

    // 2ページ目の行データは表示されない（ページネーションにより）
    expect(screen.queryByText('Sato')).not.toBeInTheDocument();
    expect(screen.queryByText('Ito')).not.toBeInTheDocument();

    // 非表示カラムのデータは表示されない
    expect(screen.queryByText('非表示データ1')).not.toBeInTheDocument();
    expect(screen.queryByText('非表示データ2')).not.toBeInTheDocument();
  });

  test('ページネーションが正しく機能すること', () => {
    // 2ページ目のデータを渡す（slice(2, 4)で3番目と4番目の要素）
    const secondPageData = mockRowData.slice(2, 4);
    const props = getBaseProps({
      rowData: secondPageData,
      page: 2
    });

    render(
      <table>
        <SortableTableRows {...props} />
      </table>
    );

    // 2ページ目の行データが表示される
    expect(screen.getByText('Sato')).toBeInTheDocument();
    expect(screen.getByText('Ito')).toBeInTheDocument();

    // 1ページ目の行データは表示されない
    expect(screen.queryByText('Tanaka')).not.toBeInTheDocument();
    expect(screen.queryByText('Suzuki')).not.toBeInTheDocument();
  });

  test('ソートが昇順で正しく機能すること', () => {
    // 名前でソート済みのデータを渡す（昇順: Ito, Sato, Suzuki, Tanaka）
    const sortedData: RowDefinition[] = [
      mockRowData[3], // Ito
      mockRowData[2], // Sato
      mockRowData[1], // Suzuki
      mockRowData[0], // Tanaka
    ];

    const props = getBaseProps({
      rowData: sortedData.slice(0, 2), // 最初の2件のみ表示
      sortParams: { sortColumn: 'name', sortOrder: 'asc' }
    });
    render(
      <table>
        <SortableTableRows {...props} />
      </table>
    );

    // 名前の昇順でソートされた最初のページが表示される
    // ('Ito'と'Sato'が先頭に来る)
    const cells = screen.getAllByRole('cell');
    const visibleNames = cells.filter(cell => {
      return ['Ito', 'Sato', 'Suzuki', 'Tanaka'].includes(cell.textContent ?? '');
    }).map(cell => cell.textContent);

    expect(visibleNames[0]).toBe('Ito');
    expect(visibleNames[1]).toBe('Sato');
  });

  test('ソートが降順で正しく機能すること', () => {
    // 名前でソート済みのデータを渡す（降順: Tanaka, Suzuki, Sato, Ito）
    const sortedData: RowDefinition[] = [
      mockRowData[0], // Tanaka
      mockRowData[1], // Suzuki
      mockRowData[2], // Sato
      mockRowData[3], // Ito
    ];

    const props = getBaseProps({
      rowData: sortedData.slice(0, 2), // 最初の2件のみ表示
      sortParams: { sortColumn: 'name', sortOrder: 'desc' }
    });
    render(
      <table>
        <SortableTableRows {...props} />
      </table>
    );

    // 名前の降順でソートされた最初のページが表示される
    // ('Tanaka'と'Suzuki'が先頭に来る)
    const cells = screen.getAllByRole('cell');
    const visibleNames = cells.filter(cell => {
      return ['Ito', 'Sato', 'Suzuki', 'Tanaka'].includes(cell.textContent ?? '');
    }).map(cell => cell.textContent);

    expect(visibleNames[0]).toBe('Tanaka');
    expect(visibleNames[1]).toBe('Suzuki');
  });

  test('ソートが数値型のカラムでも正しく機能すること', () => {
    // 年齢でソート済みのデータを渡す（昇順: 25, 30, 35, 40）
    const sortedData: RowDefinition[] = [
      mockRowData[1], // Suzuki (25)
      mockRowData[0], // Tanaka (30)
      mockRowData[3], // Ito (35)
      mockRowData[2], // Sato (40)
    ];

    const props = getBaseProps({
      rowData: sortedData.slice(0, 2), // 最初の2件のみ表示
      sortParams: { sortColumn: 'age', sortOrder: 'asc' }
    });
    render(
      <table>
        <SortableTableRows {...props} />
      </table>
    );

    // 年齢の昇順でソートされた最初のページが表示される
    // (25歳の'Suzuki'と30歳の'Tanaka'が先頭に来る)
    const cells = screen.getAllByRole('cell');
    const visibleAges = cells.filter(cell => {
      return ['25', '30', '35', '40'].includes(cell.textContent ?? '');
    }).map(cell => cell.textContent);

    expect(visibleAges[0]).toBe('25');
    expect(visibleAges[1]).toBe('30');
  });

  test('rowsPerPageが変更されると表示される行数が変わること', () => {
    // 1ページに3行表示するためのデータを渡す
    const threeRowsData = mockRowData.slice(0, 3);
    const props = getBaseProps({
      rowData: threeRowsData,
      rowsPerPage: 3
    });

    render(
      <table>
        <SortableTableRows {...props} />
      </table>
    );

    // 3行表示されることを確認
    expect(screen.getByText('Tanaka')).toBeInTheDocument();
    expect(screen.getByText('Suzuki')).toBeInTheDocument();
    expect(screen.getByText('Sato')).toBeInTheDocument();

    // 4行目は表示されない
    expect(screen.queryByText('Ito')).not.toBeInTheDocument();
  });

  test('行にスタイルが適用されること', () => {
    // 特殊なスタイルを持つ行データ
    const styledRowData: RowDefinition[] = [
      {
        cells: [
          { id: 'styled-id', columnId: 'id', cell: '1', value: '1' },
          { id: 'styled-name', columnId: 'name', cell: '特殊スタイル行', value: 'special' }
        ],
        rowSx: { backgroundColor: 'red' }
      }
    ];

    const props = getBaseProps({ rowData: styledRowData });
    render(
      <table>
        <SortableTableRows {...props} />
      </table>
    );

    // 特殊スタイルの行が表示される
    expect(screen.getByText('特殊スタイル行')).toBeInTheDocument();

    // スタイルが適用されていることを確認（実際にはdom属性でのスタイル確認が必要）
    const row = screen.getByText('特殊スタイル行').closest('tr');
    expect(row).toHaveStyle('background-color: red');
  });
});
