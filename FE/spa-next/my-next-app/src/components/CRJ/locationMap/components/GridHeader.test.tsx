import { render, screen } from '@testing-library/react';
import { GridHeader } from './GridHeader';

describe('GridHeader', () => {
  it('列ヘッダーが正しくレンダリングされる', () => {
    const columns = ['A', 'B', 'C', 'D', 'E'];

    render(
      <table>
        <GridHeader length={columns.length} />
      </table>
    );

    // 各列ヘッダーが表示されることを確認
    columns.forEach(col => {
      expect(screen.getByText(col)).toBeInTheDocument();
    });
  });

  it('アイコンヘッダーが表示される', () => {
    const { container } = render(
      <table>
        <GridHeader length={1} />
      </table>
    );

    // アイコンヘッダーセルが存在することを確認
    const iconHeader = container.querySelector('.iconHeader');
    expect(iconHeader).toBeInTheDocument();

    // SignalCellular4BarRoundedアイコンが表示されることを確認
    const icon = container.querySelector('.icon');
    expect(icon).toBeInTheDocument();
    expect(icon?.tagName).toBe('svg');
  });

  it('空の列配列でもエラーが発生しない', () => {
    const { container } = render(
      <table>
        <GridHeader length={0} />
      </table>
    );

    // アイコンヘッダーは表示される
    const iconHeader = container.querySelector('.iconHeader');
    expect(iconHeader).toBeInTheDocument();

    // データ列ヘッダーは存在しない
    const headerCells = container.querySelectorAll('.headerCell');
    expect(headerCells).toHaveLength(0);
  });

  it('大量の列でも正しくレンダリングされる', () => {
    const manyColumns = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(65 + i)
    ); // A-Z

    render(
      <table>
        <GridHeader length={manyColumns.length} />
      </table>
    );

    // 全ての列ヘッダーが表示されることを確認
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Z')).toBeInTheDocument();

    // ヘッダーセルの数を確認（アイコンヘッダー + データ列）
    const allHeaders = screen.getAllByRole('columnheader');
    expect(allHeaders).toHaveLength(27); // 1 + 26
  });

  it('ヘッダーセルに正しいクラスが適用される', () => {
    const { container } = render(
      <table>
        <GridHeader length={2} />
      </table>
    );

    // 各ヘッダーセルにheaderCellクラスが適用されることを確認
    const headerCells = container.querySelectorAll('.headerCell');
    expect(headerCells).toHaveLength(2);

    headerCells.forEach(cell => {
      expect(cell.tagName).toBe('TH');
    });
  });

  it('列の順序が保持される', () => {
    render(
      <table>
        <GridHeader length={4} />
      </table>
    );

    const headerCells = screen.getAllByRole('columnheader');
    // アイコンヘッダーをスキップして、データ列ヘッダーの順序を確認
    // generateColumns関数は常にA, B, C, D...の順序で生成する
    expect(headerCells[1]).toHaveTextContent('A');
    expect(headerCells[2]).toHaveTextContent('B');
    expect(headerCells[3]).toHaveTextContent('C');
    expect(headerCells[4]).toHaveTextContent('D');
  });

  it('generateColumns関数による列名生成', () => {
    // GridHeaderコンポーネントはlengthを受け取り、
    // generateColumns関数でA, B, C...の順に列名を生成する
    render(
      <table>
        <GridHeader length={4} />
      </table>
    );

    // 生成される列名を確認
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('thead要素内にレンダリングされる', () => {
    const { container } = render(
      <table>
        <GridHeader length={1} />
      </table>
    );

    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();

    const tr = thead?.querySelector('tr');
    expect(tr).toBeInTheDocument();
  });

  // 以下、不足している観点のテストケース

  it('アイコンのスタイルが正しく適用される', () => {
    const { container } = render(
      <table>
        <GridHeader length={1} />
      </table>
    );

    const icon = container.querySelector('.icon');
    expect(icon).toHaveStyle({
      color: 'rgb(224, 224, 224)'
    });
  });

  it('27列以上（AA, AB...）でも正しく表示される', () => {
    render(
      <table>
        <GridHeader length={28} />
      </table>
    );

    // 26列目まで
    expect(screen.getByText('Z')).toBeInTheDocument();
    // 27列目以降
    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('負の数を渡してもエラーが発生しない', () => {
    const { container } = render(
      <table>
        <GridHeader length={-5} />
      </table>
    );

    // アイコンヘッダーのみ表示される
    const iconHeader = container.querySelector('.iconHeader');
    expect(iconHeader).toBeInTheDocument();

    // データ列ヘッダーは存在しない
    const headerCells = container.querySelectorAll('.headerCell');
    expect(headerCells).toHaveLength(0);
  });

  it('非常に大きな数でも処理できる', () => {
    render(
      <table>
        <GridHeader length={100} />
      </table>
    );

    // 100列すべてが生成されることを確認
    const allHeaders = screen.getAllByRole('columnheader');
    expect(allHeaders).toHaveLength(101); // アイコンヘッダー + 100データ列
  });

  it('sticky positionが正しく機能することを確認', () => {
    const { container } = render(
      <table>
        <GridHeader length={3} />
      </table>
    );

    // すべてのヘッダーがsticky positionを持つことを確認
    const allHeaders = container.querySelectorAll('th');
    allHeaders.forEach(header => {
      expect(header).toHaveStyle({ position: 'sticky', top: '0px' });
    });

    // アイコンヘッダーは左にも固定
    const iconHeader = container.querySelector('.iconHeader');
    expect(iconHeader).toHaveStyle({ left: '0px' });
  });

  it('アクセシビリティ: 適切なrole属性を持つ', () => {
    render(
      <table>
        <GridHeader length={3} />
      </table>
    );

    // すべてのヘッダーセルがcolumnheader roleを持つ
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(4); // アイコン + 3列
  });
});
