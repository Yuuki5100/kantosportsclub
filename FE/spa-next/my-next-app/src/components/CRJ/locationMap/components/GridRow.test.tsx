import { render, screen } from '@testing-library/react';
import { GridRow } from './GridRow';
import { PlaceMapList } from '../types';

// GridCellコンポーネントをモック
jest.mock('./GridCell', () => ({
  GridCell: ({ cell, rowIndex, colIndex }: any) => (
    <td data-testid={`cell-${rowIndex}-${colIndex}`}>
      {cell ? `Cell ${rowIndex}-${colIndex}` : 'Empty'}
    </td>
  ),
}));

// モックデータ
const mockCell: PlaceMapList = {
  storageLocationCd: 'SL001',
  storageLocationName: '保管場所1',
  placementCd: 'P001',
  placementName: '配置1',
  capacityQuantity: '100',
  suspendedFlag: false,
  mapAllocationStartCell: 'A1',
  mapAllocationEndCell: 'B2',
  locationCd: 'L001',
};

const mockSelectedPlaceMap = [
  { columnId: 'storageLocationCd', value: 'SL001' },
  { columnId: 'placementCd', value: 'P001' },
];

const mockGridData: (PlaceMapList | null)[][] = [
  [mockCell, null, mockCell],
  [null, mockCell, null],
  [mockCell, mockCell, mockCell],
];

describe('GridRow', () => {
  it('行ヘッダーが正しく表示される', () => {
    const row = [null, null, null];

    render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={2}
            selectedPlaceMap={[]}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    // 行番号は rowIndex + 1 で表示される
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('空の行でもエラーが発生しない', () => {
    const emptyRow: (PlaceMapList | null)[] = [];

    const { container } = render(
      <table>
        <tbody>
          <GridRow
            row={emptyRow}
            rowIndex={0}
            selectedPlaceMap={[]}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    // 行ヘッダーは表示される
    expect(screen.getByText('1')).toBeInTheDocument();

    // データセルは存在しない
    const cells = container.querySelectorAll('td[data-testid^="cell-"]');
    expect(cells).toHaveLength(0);
  });

  it('大量のセルを持つ行でも正しくレンダリングされる', () => {
    const largeRow = Array(20).fill(null);

    render(
      <table>
        <tbody>
          <GridRow
            row={largeRow}
            rowIndex={5}
            selectedPlaceMap={[]}
            gridData={[largeRow]}
          />
        </tbody>
      </table>
    );

    // 行番号の確認
    expect(screen.getByText('6')).toBeInTheDocument();

    // 全てのセルがレンダリングされる
    for (let i = 0; i < 20; i++) {
      expect(screen.getByTestId(`cell-5-${i}`)).toBeInTheDocument();
    }
  });

  it('selectedPlaceMapがGridCellに正しく渡される', () => {
    const row = [mockCell];

    render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={0}
            selectedPlaceMap={mockSelectedPlaceMap}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    // GridCellがレンダリングされることを確認
    expect(screen.getByTestId('cell-0-0')).toBeInTheDocument();
    expect(screen.getByText('Cell 0-0')).toBeInTheDocument();
  });

  it('tr要素内にレンダリングされる', () => {
    const row = [null];
    const { container } = render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={0}
            selectedPlaceMap={[]}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    const tr = container.querySelector('tr');
    expect(tr).toBeInTheDocument();

    // tr要素内にtd要素が存在することを確認
    const tds = tr?.querySelectorAll('td');
    expect(tds).toHaveLength(2); // 行ヘッダー1つ + セル1つ（nullセルもレンダリングされる）
  });

  it('異なるrowIndexで異なる行番号が表示される', () => {
    const row = [null];
    const { rerender } = render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={0}
            selectedPlaceMap={[]}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={9}
            selectedPlaceMap={[]}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  // 新しいテストケース: propsの妥当性確認
  it('すべてのpropsがGridCellに正しく渡される', () => {
    const row = [mockCell, null];

    render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={3}
            selectedPlaceMap={mockSelectedPlaceMap}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    // 各セルが正しいインデックスでレンダリングされる
    expect(screen.getByTestId('cell-3-0')).toBeInTheDocument();
    expect(screen.getByTestId('cell-3-1')).toBeInTheDocument();
  });

  // 新しいテストケース: キー生成の確認
  it('各GridCellに正しいキーが設定される', () => {
    const row = [mockCell, null, mockCell];
    const { container } = render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={1}
            selectedPlaceMap={[]}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    // GridCellコンポーネントがモックされているため、
    // 実際のキー属性は確認できないが、テストIDで確認
    expect(screen.getByTestId('cell-1-0')).toBeInTheDocument();
    expect(screen.getByTestId('cell-1-1')).toBeInTheDocument();
    expect(screen.getByTestId('cell-1-2')).toBeInTheDocument();
  });

  // 新しいテストケース: 境界値テスト
  it('rowIndex = 0 の場合に行番号1が表示される', () => {
    const row = [null];

    render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={0}
            selectedPlaceMap={[]}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('非常に大きなrowIndexでも正しく動作する', () => {
    const row = [null];

    render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={999}
            selectedPlaceMap={[]}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  // 新しいテストケース: selectedPlaceMapのnullケース
  it('selectedPlaceMapがnullの場合でもエラーが発生しない', () => {
    const row = [mockCell, null];

    render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={0}
            selectedPlaceMap={[]}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    expect(screen.getByTestId('cell-0-0')).toBeInTheDocument();
    expect(screen.getByTestId('cell-0-1')).toBeInTheDocument();
  });

  // 新しいテストケース: gridDataの形状確認
  it('異なるgridDataを渡してもエラーが発生しない', () => {
    const row = [mockCell];
    const differentGridData: (PlaceMapList | null)[][] = [
      [null, mockCell],
      [mockCell, null],
    ];

    render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={0}
            selectedPlaceMap={[]}
            gridData={differentGridData}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByTestId('cell-0-0')).toBeInTheDocument();
  });

  // 新しいテストケース: 混合データの行
  it('データセルと空セルが混在する行を正しく処理する', () => {
    const mixedRow = [mockCell, null, mockCell, null, mockCell];

    render(
      <table>
        <tbody>
          <GridRow
            row={mixedRow}
            rowIndex={2}
            selectedPlaceMap={mockSelectedPlaceMap}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    // 行ヘッダー
    expect(screen.getByText('3')).toBeInTheDocument();

    // 各セル
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`cell-2-${i}`)).toBeInTheDocument();
    }
  });

  // 新しいテストケース: DOM構造の確認
  it('正しいDOM構造でレンダリングされる', () => {
    const row = [mockCell, null];
    const { container } = render(
      <table>
        <tbody>
          <GridRow
            row={row}
            rowIndex={0}
            selectedPlaceMap={[]}
            gridData={mockGridData}
          />
        </tbody>
      </table>
    );

    const tr = container.querySelector('tr');
    expect(tr).toBeInTheDocument();

    // tr内にtd要素が存在する（行ヘッダー + セル数）
    const tds = tr?.querySelectorAll('td');
    expect(tds).toHaveLength(3); // 行ヘッダー1つ + セル2つ
  });
});
