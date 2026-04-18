// 包括的な境界線ロジックのテスト - 様々な配置パターンを網羅

import {
  createGetAdjacentCell,
  calculateBorderInfo,
  calculateAllBorders,
} from './borderLogic';
import {
  createGetAdjacentCellForEmpty,
  calculateEmptyCellBorders,
} from './emptyCellBorderLogic';
import { PlaceMapList } from '../types';
import { COLORS } from '../constants';

describe('Comprehensive Border Logic Tests', () => {
  // テスト用のセル作成関数
  const createTestCell = (
    storageLocationCd: string,
    placementName: string = 'テスト配置',
    startCell: string = 'A1',
    endCell: string = 'A1'
  ): PlaceMapList => ({
    storageLocationCd,
    storageLocationName: '保管場所',
    placementCd: `P${Math.random().toString(36).substr(2, 6)}`,
    placementName,
    capacityQuantity: '100',
    suspendedFlag: false,
    mapAllocationStartCell: startCell,
    mapAllocationEndCell: endCell,
    locationCd: 'L001',
  });

  // グリッド作成ヘルパー関数
  const createGrid = (rows: number, cols: number): (PlaceMapList | null)[][] => {
    return Array(rows).fill(null).map(() => Array(cols).fill(null));
  };

  // セル配置ヘルパー関数
  const placeCell = (
    grid: (PlaceMapList | null)[][],
    cell: PlaceMapList,
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ) => {
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (row < grid.length && col < grid[0].length) {
          grid[row][col] = cell;
        }
      }
    }
  };

  describe('基本配置パターン', () => {
    describe('単一セル配置', () => {
      it('単一グルーピングありセル - 四方に空セル', () => {
        const cell = createTestCell('SL001', '単一', 'B2', 'B2');
        const grid = createGrid(4, 4);
        placeCell(grid, cell, 1, 1, 1, 1);

        const borders = calculateAllBorders(cell, { row: 1, col: 1 }, { row: 1, col: 1 }, grid);

        // 隣接セルがないため、グルーピングありセルは境界線なし
        expect(borders.borderTop).toBe('none');
        expect(borders.borderRight).toBe('none');
        expect(borders.borderBottom).toBe('none');
        expect(borders.borderLeft).toBe('none');
      });

      it('単一通路セル - 四方に空セル', () => {
        const cell = createTestCell('', '通路', 'B2', 'B2');
        const grid = createGrid(4, 4);
        placeCell(grid, cell, 1, 1, 1, 1);

        const borders = calculateAllBorders(cell, { row: 1, col: 1 }, { row: 1, col: 1 }, grid);

        // 通路セルは隣接セルがない場合でも青いグループ境界線
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });

    describe('2x2セル配置', () => {
      it('2x2グルーピングありセル - 同一保管場所', () => {
        const cell = createTestCell('SL001', '2x2配置', 'A1', 'B2');
        const grid = createGrid(4, 4);
        placeCell(grid, cell, 0, 0, 1, 1);

        // 左上セル（開始セル）の境界線を確認
        const borders = calculateAllBorders(cell, { row: 0, col: 0 }, { row: 1, col: 1 }, grid);

        // グリッド端では青いグループ境界線が表示される、内部は境界線なし
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderBottom).toBe('none'); // 内部境界は表示しない
        expect(borders.borderRight).toBe('none'); // 内部境界は表示しない
      });

      it('2x2通路セル', () => {
        const cell = createTestCell('', '2x2通路', 'A1', 'B2');
        const grid = createGrid(4, 4);
        placeCell(grid, cell, 0, 0, 1, 1);

        const borders = calculateAllBorders(cell, { row: 0, col: 0 }, { row: 1, col: 1 }, grid);

        // 通路セルも隣接セルがない場合、青いグループ境界線
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });
  });

  describe('隣接パターン', () => {
    describe('同一保管場所の隣接', () => {
      it('水平隣接 - 同一保管場所のグルーピングありセル', () => {
        const cell1 = createTestCell('SL001', '左', 'A1', 'A1');
        const cell2 = createTestCell('SL001', '右', 'B1', 'B1');
        const grid = createGrid(3, 3);
        placeCell(grid, cell1, 0, 0, 0, 0);
        placeCell(grid, cell2, 0, 1, 0, 1);

        const borders1 = calculateAllBorders(cell1, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);
        const borders2 = calculateAllBorders(cell2, { row: 0, col: 1 }, { row: 0, col: 1 }, grid);

        // 同一保管場所同士の境界は表示しない
        expect(borders1.borderRight).toBe(`1px solid ${COLORS.BORDER}`);
        expect(borders2.borderLeft).toBe(`1px solid ${COLORS.BORDER}`);
      });

      it('垂直隣接 - 同一保管場所のグルーピングありセル', () => {
        const cell1 = createTestCell('SL001', '上', 'A1', 'A1');
        const cell2 = createTestCell('SL001', '下', 'A2', 'A2');
        const grid = createGrid(3, 3);
        placeCell(grid, cell1, 0, 0, 0, 0);
        placeCell(grid, cell2, 1, 0, 1, 0);

        const borders1 = calculateAllBorders(cell1, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);
        const borders2 = calculateAllBorders(cell2, { row: 1, col: 0 }, { row: 1, col: 0 }, grid);

        // 同一保管場所同士の境界は表示しない
        expect(borders1.borderBottom).toBe(`1px solid ${COLORS.BORDER}`);
        expect(borders2.borderTop).toBe(`1px solid ${COLORS.BORDER}`);
      });
    });

    describe('異なる保管場所の隣接', () => {
      it('水平隣接 - 異なる保管場所のグルーピングありセル', () => {
        const cell1 = createTestCell('SL001', '左', 'A1', 'A1');
        const cell2 = createTestCell('SL002', '右', 'B1', 'B1');
        const grid = createGrid(3, 3);
        placeCell(grid, cell1, 0, 0, 0, 0);
        placeCell(grid, cell2, 0, 1, 0, 1);

        const borders1 = calculateAllBorders(cell1, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);
        const borders2 = calculateAllBorders(cell2, { row: 0, col: 1 }, { row: 0, col: 1 }, grid);

        // 異なる保管場所同士は青い境界線
        expect(borders1.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders2.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });

      it('垂直隣接 - 異なる保管場所のグルーピングありセル', () => {
        const cell1 = createTestCell('SL001', '上', 'A1', 'A1');
        const cell2 = createTestCell('SL002', '下', 'A2', 'A2');
        const grid = createGrid(3, 3);
        placeCell(grid, cell1, 0, 0, 0, 0);
        placeCell(grid, cell2, 1, 0, 1, 0);

        const borders1 = calculateAllBorders(cell1, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);
        const borders2 = calculateAllBorders(cell2, { row: 1, col: 0 }, { row: 1, col: 0 }, grid);

        // 異なる保管場所同士は青い境界線
        expect(borders1.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders2.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });

    describe('グルーピングありセルと通路セルの隣接', () => {
      it('水平隣接 - グルーピングありセルと通路セル', () => {
        const cell1 = createTestCell('SL001', 'グループ', 'A1', 'A1');
        const cell2 = createTestCell('', '通路', 'B1', 'B1');
        const grid = createGrid(3, 3);
        placeCell(grid, cell1, 0, 0, 0, 0);
        placeCell(grid, cell2, 0, 1, 0, 1);

        const borders1 = calculateAllBorders(cell1, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);
        const borders2 = calculateAllBorders(cell2, { row: 0, col: 1 }, { row: 0, col: 1 }, grid);

        // グルーピングありセルと通路セルは青い境界線
        expect(borders1.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders2.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });

      it('垂直隣接 - グルーピングありセルと通路セル', () => {
        const cell1 = createTestCell('SL001', 'グループ', 'A1', 'A1');
        const cell2 = createTestCell('', '通路', 'A2', 'A2');
        const grid = createGrid(3, 3);
        placeCell(grid, cell1, 0, 0, 0, 0);
        placeCell(grid, cell2, 1, 0, 1, 0);

        const borders1 = calculateAllBorders(cell1, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);
        const borders2 = calculateAllBorders(cell2, { row: 1, col: 0 }, { row: 1, col: 0 }, grid);

        // グルーピングありセルと通路セルは青い境界線
        expect(borders1.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders2.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });

    describe('通路セル同士の隣接', () => {
      it('水平隣接 - 通路セル同士', () => {
        const cell1 = createTestCell('', '通路1', 'A1', 'A1');
        const cell2 = createTestCell('', '通路2', 'B1', 'B1');
        const grid = createGrid(3, 3);
        placeCell(grid, cell1, 0, 0, 0, 0);
        placeCell(grid, cell2, 0, 1, 0, 1);

        const borders1 = calculateAllBorders(cell1, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);
        const borders2 = calculateAllBorders(cell2, { row: 0, col: 1 }, { row: 0, col: 1 }, grid);

        // 通路セル同士は青い境界線
        expect(borders1.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders2.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });

      it('垂直隣接 - 通路セル同士', () => {
        const cell1 = createTestCell('', '通路1', 'A1', 'A1');
        const cell2 = createTestCell('', '通路2', 'A2', 'A2');
        const grid = createGrid(3, 3);
        placeCell(grid, cell1, 0, 0, 0, 0);
        placeCell(grid, cell2, 1, 0, 1, 0);

        const borders1 = calculateAllBorders(cell1, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);
        const borders2 = calculateAllBorders(cell2, { row: 1, col: 0 }, { row: 1, col: 0 }, grid);

        // 通路セル同士は青い境界線
        expect(borders1.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders2.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });
  });

  describe('複雑な配置パターン', () => {
    describe('L字型配置', () => {
      it('L字型グルーピングありセル - 内部境界なし', () => {
        const cell = createTestCell('SL001', 'L字', 'A1', 'C2');
        const grid = createGrid(4, 4);
        
        // L字型: A1-C1, A2-B2
        placeCell(grid, cell, 0, 0, 0, 2); // 上辺
        placeCell(grid, cell, 1, 0, 1, 1); // 下辺左側のみ

        const borders = calculateAllBorders(cell, { row: 0, col: 0 }, { row: 1, col: 2 }, grid);

        // グリッド端では青いグループ境界線が表示される
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        // 複雑な形状のため、実際の境界線は隣接セルの有無により決定される
      });
    });

    describe('コの字型配置', () => {
      it('コの字型グルーピングありセル', () => {
        const cell = createTestCell('SL001', 'コの字', 'A1', 'C3');
        const grid = createGrid(5, 5);
        
        // コの字型: A1-C1, A2-A3, C2-C3
        placeCell(grid, cell, 0, 0, 0, 2); // 上辺
        placeCell(grid, cell, 1, 0, 2, 0); // 左辺
        placeCell(grid, cell, 1, 2, 2, 2); // 右辺

        const borders = calculateAllBorders(cell, { row: 0, col: 0 }, { row: 2, col: 2 }, grid);

        // グリッド端では青いグループ境界線
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });

    describe('十字型配置', () => {
      it('十字型グルーピングありセル', () => {
        const cell = createTestCell('SL001', '十字', 'A1', 'E5');
        const grid = createGrid(6, 6);
        
        // 十字型: B1-D1, B2-D4, B5-D5, A3-E3
        placeCell(grid, cell, 0, 1, 0, 3); // 上辺
        placeCell(grid, cell, 1, 1, 3, 3); // 縦辺
        placeCell(grid, cell, 4, 1, 4, 3); // 下辺
        placeCell(grid, cell, 2, 0, 2, 4); // 横辺

        const borders = calculateAllBorders(cell, { row: 0, col: 0 }, { row: 4, col: 4 }, grid);

        // グリッド端では青いグループ境界線
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });
  });

  describe('スパンセルの境界線パターン', () => {
    describe('横スパンセル', () => {
      it('1x3横スパンセル - 同一保管場所', () => {
        const cell = createTestCell('SL001', '横スパン', 'A1', 'C1');
        const grid = createGrid(3, 5);
        placeCell(grid, cell, 0, 0, 0, 2);

        const borders = calculateAllBorders(cell, { row: 0, col: 0 }, { row: 0, col: 2 }, grid);

        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderBottom).toBe('none');
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderRight).toBe('none');
      });

      it('1x5横スパンセル - 隣接セルとの境界', () => {
        const spanCell = createTestCell('SL001', '横スパン', 'A1', 'E1');
        const neighborCell = createTestCell('SL002', '隣接', 'A2', 'E2');
        const grid = createGrid(4, 6);
        
        placeCell(grid, spanCell, 0, 0, 0, 4);
        placeCell(grid, neighborCell, 1, 0, 1, 4);

        const spanBorders = calculateAllBorders(spanCell, { row: 0, col: 0 }, { row: 0, col: 4 }, grid);

        // 異なる保管場所の隣接セルとは青い境界線
        expect(spanBorders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });

    describe('縦スパンセル', () => {
      it('3x1縦スパンセル - 同一保管場所', () => {
        const cell = createTestCell('SL001', '縦スパン', 'A1', 'A3');
        const grid = createGrid(5, 3);
        placeCell(grid, cell, 0, 0, 2, 0);

        const borders = calculateAllBorders(cell, { row: 0, col: 0 }, { row: 2, col: 0 }, grid);

        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderBottom).toBe('none');
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderRight).toBe('none');
      });

      it('5x1縦スパンセル - 部分的隣接セル', () => {
        const spanCell = createTestCell('SL001', '縦スパン', 'A1', 'A5');
        const partialNeighbor = createTestCell('SL002', '部分隣接', 'B2', 'B4');
        const grid = createGrid(6, 4);
        
        placeCell(grid, spanCell, 0, 0, 4, 0);
        placeCell(grid, partialNeighbor, 1, 1, 3, 1);

        const spanBorders = calculateAllBorders(spanCell, { row: 0, col: 0 }, { row: 4, col: 0 }, grid);

        // 一部に隣接セルがあるため青い境界線
        expect(spanBorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });

    describe('大型スパンセル', () => {
      it('3x3スパンセル - 四方に異なる保管場所', () => {
        const centerCell = createTestCell('SL001', '中央3x3', 'B2', 'D4');
        const topCell = createTestCell('SL002', '上', 'B1', 'D1');
        const bottomCell = createTestCell('SL003', '下', 'B5', 'D5');
        const leftCell = createTestCell('SL004', '左', 'A2', 'A4');
        const rightCell = createTestCell('SL005', '右', 'E2', 'E4');
        
        const grid = createGrid(7, 7);
        placeCell(grid, centerCell, 1, 1, 3, 3);
        placeCell(grid, topCell, 0, 1, 0, 3);
        placeCell(grid, bottomCell, 4, 1, 4, 3);
        placeCell(grid, leftCell, 1, 0, 3, 0);
        placeCell(grid, rightCell, 1, 4, 3, 4);

        const centerBorders = calculateAllBorders(centerCell, { row: 1, col: 1 }, { row: 3, col: 3 }, grid);

        // 四方すべてに異なる保管場所の隣接セルがあるため、すべて青い境界線
        expect(centerBorders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(centerBorders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(centerBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(centerBorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });
  });

  describe('空セル（EmptyCell）の境界線パターン', () => {
    describe('基本的な空セル境界線', () => {
      it('空セル - 四方に空セル', () => {
        const grid = createGrid(3, 3);
        const borders = calculateEmptyCellBorders(1, 1, grid);

        // 全方向が空セルまたはグリッド外なので黒い境界線
        expect(borders.borderTop).toBe(`1px solid ${COLORS.GRID_BORDER}`);
        expect(borders.borderRight).toBe(`1px solid ${COLORS.GRID_BORDER}`);
        expect(borders.borderBottom).toBe(`1px solid ${COLORS.GRID_BORDER}`);
        expect(borders.borderLeft).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      });

      it('空セル - グルーピングありセルに囲まれた中央', () => {
        const groupCell = createTestCell('SL001', 'グループ');
        const grid = createGrid(3, 3);
        
        // 中央を除いて全てグルーピングありセル
        placeCell(grid, groupCell, 0, 0, 0, 2);
        placeCell(grid, groupCell, 1, 0, 1, 0);
        placeCell(grid, groupCell, 1, 2, 1, 2);
        placeCell(grid, groupCell, 2, 0, 2, 2);

        const borders = calculateEmptyCellBorders(1, 1, grid);

        // 全方向がグルーピングありセルなので青い境界線
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });

      it('空セル - 通路セルに囲まれた中央', () => {
        const passageCell = createTestCell('', '通路');
        const grid = createGrid(3, 3);
        
        // 中央を除いて全て通路セル
        placeCell(grid, passageCell, 0, 0, 0, 2);
        placeCell(grid, passageCell, 1, 0, 1, 0);
        placeCell(grid, passageCell, 1, 2, 1, 2);
        placeCell(grid, passageCell, 2, 0, 2, 2);

        const borders = calculateEmptyCellBorders(1, 1, grid);

        // 全方向が通路セル（セルが存在）なので青い境界線
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });

    describe('混在パターンの空セル境界線', () => {
      it('空セル - グルーピングありセルと通路セルの混在', () => {
        const groupCell = createTestCell('SL001', 'グループ');
        const passageCell = createTestCell('', '通路');
        const grid = createGrid(3, 3);
        
        // 混在配置
        placeCell(grid, groupCell, 0, 1, 0, 1); // 上
        placeCell(grid, passageCell, 1, 2, 1, 2); // 右
        placeCell(grid, groupCell, 2, 1, 2, 1); // 下
        placeCell(grid, passageCell, 1, 0, 1, 0); // 左

        const borders = calculateEmptyCellBorders(1, 1, grid);

        // 各方向で異なる境界線（セルが存在する場合は青い境界線）
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // グルーピングあり
        expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 通路セル（セルが存在）
        expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // グルーピングあり
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 通路セル（セルが存在）
      });

      it('空セル - 部分的に隣接セルがある場合', () => {
        const groupCell = createTestCell('SL001', 'グループ');
        const grid = createGrid(4, 4);
        
        // 一部のみにセル配置
        placeCell(grid, groupCell, 1, 0, 1, 0); // 左のみ
        // 上、右、下は空セル

        const borders = calculateEmptyCellBorders(1, 1, grid);

        expect(borders.borderTop).toBe(`1px solid ${COLORS.GRID_BORDER}`); // 空セル
        expect(borders.borderRight).toBe(`1px solid ${COLORS.GRID_BORDER}`); // 空セル
        expect(borders.borderBottom).toBe(`1px solid ${COLORS.GRID_BORDER}`); // 空セル
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // グルーピングあり
      });
    });

    describe('グリッド端の空セル', () => {
      it('左上角の空セル', () => {
        const groupCell = createTestCell('SL001', 'グループ');
        const grid = createGrid(3, 3);
        placeCell(grid, groupCell, 0, 1, 0, 1); // 右
        placeCell(grid, groupCell, 1, 0, 1, 0); // 下

        const borders = calculateEmptyCellBorders(0, 0, grid);

        expect(borders.borderTop).toBe(`1px solid ${COLORS.GRID_BORDER}`); // グリッド外
        expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // グルーピングあり
        expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // グルーピングあり
        expect(borders.borderLeft).toBe(`1px solid ${COLORS.GRID_BORDER}`); // グリッド外
      });

      it('右下角の空セル', () => {
        const passageCell = createTestCell('', '通路');
        const grid = createGrid(3, 3);
        placeCell(grid, passageCell, 2, 1, 2, 1); // 左
        placeCell(grid, passageCell, 1, 2, 1, 2); // 上

        const borders = calculateEmptyCellBorders(2, 2, grid);

        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 通路セル（セルが存在）
        expect(borders.borderRight).toBe(`1px solid ${COLORS.GRID_BORDER}`); // グリッド外
        expect(borders.borderBottom).toBe(`1px solid ${COLORS.GRID_BORDER}`); // グリッド外
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 通路セル（セルが存在）
      });
    });
  });

  describe('実際のCSVデータパターンの再現', () => {
    describe('CSV Issue #1: 同一保管場所の境界線問題', () => {
      it('P01011とP120の境界線（同一保管場所SL004）', () => {
        // 実際の報告されたケース
        const cell1 = createTestCell('SL004', '配置', 'D5', 'D6'); // P01011
        const cell2 = createTestCell('SL004', '配置3456', 'A7', 'D7'); // P120
        const cell3 = createTestCell('SL003', '配置1', 'A5', 'C6'); // P1212
        
        const grid = createGrid(10, 12);
        
        // A5-C6にP1212を配置
        placeCell(grid, cell3, 4, 0, 5, 2);
        // D5-D6にP01011を配置
        placeCell(grid, cell1, 4, 3, 5, 3);
        // A7-D7にP120を配置
        placeCell(grid, cell2, 6, 0, 6, 3);

        const borders1 = calculateAllBorders(cell1, { row: 4, col: 3 }, { row: 5, col: 3 }, grid);
        const borders2 = calculateAllBorders(cell2, { row: 6, col: 0 }, { row: 6, col: 3 }, grid);

        // 同一保管場所のため、境界線は黒い境界線（表示しない）
        expect(borders1.borderBottom).toBe(`1px solid ${COLORS.BORDER}`);
        expect(borders2.borderTop).toBe(`1px solid ${COLORS.BORDER}`);
      });
    });

    describe('CSV Issue #2: 複雑な通路セル配置', () => {
      it('K1-K10通路セルの境界線（隣接セルとの関係）', () => {
        const passageCell = createTestCell('', '通路', 'K1', 'K10');
        const groupCell = createTestCell('SL001', 'A-1', 'A1', 'J5');
        
        const grid = createGrid(10, 12);
        
        // A1-J5にグルーピングありセルを配置
        placeCell(grid, groupCell, 0, 0, 4, 9);
        // K1-K10に通路セルを配置（列10）
        placeCell(grid, passageCell, 0, 10, 9, 10);

        // K1-K5セルの境界線を計算（隣接セルあり）
        const bordersWithNeighbor = calculateAllBorders(passageCell, { row: 0, col: 10 }, { row: 4, col: 10 }, grid);
        
        // K6-K10セルの境界線を計算（隣接セルなし）
        const bordersWithoutNeighbor = calculateAllBorders(passageCell, { row: 5, col: 10 }, { row: 9, col: 10 }, grid);

        // 通路セルは隣接セルの有無に関わらず青いグループ境界線
        expect(bordersWithNeighbor.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(bordersWithoutNeighbor.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });

    describe('CSV Issue #3: 不規則形状の配置', () => {
      it('T字型配置の境界線処理', () => {
        const tShapeCell = createTestCell('SL001', 'T字', 'A1', 'E3');
        const grid = createGrid(6, 8);
        
        // T字型配置
        placeCell(grid, tShapeCell, 0, 1, 0, 4); // 上辺
        placeCell(grid, tShapeCell, 1, 2, 2, 3); // 下部縦辺

        const borders = calculateAllBorders(tShapeCell, { row: 0, col: 1 }, { row: 2, col: 4 }, grid);

        // T字型の複雑な形状では一部の境界線は内部扱いで非表示
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe('none'); // 複雑な形状の内部境界は非表示
      });

      it('ドーナツ型配置（中央に穴）', () => {
        const outerCell = createTestCell('SL001', '外側', 'A1', 'E5');
        const grid = createGrid(8, 8);
        
        // ドーナツ型（外周のみ、中央3x3は空き）
        placeCell(grid, outerCell, 0, 0, 0, 4); // 上辺
        placeCell(grid, outerCell, 1, 0, 3, 0); // 左辺
        placeCell(grid, outerCell, 1, 4, 3, 4); // 右辺
        placeCell(grid, outerCell, 4, 0, 4, 4); // 下辺

        // 中央の空セルの境界線をチェック
        const centerEmptyBorders = calculateEmptyCellBorders(2, 2, grid);

        // 中央空セルは四方にグルーピングありセルがないため、実際の配置による
        expect(centerEmptyBorders.borderTop).toBe(`1px solid ${COLORS.GRID_BORDER}`);
        expect(centerEmptyBorders.borderBottom).toBe(`1px solid ${COLORS.GRID_BORDER}`);
        expect(centerEmptyBorders.borderLeft).toBe(`1px solid ${COLORS.GRID_BORDER}`);
        expect(centerEmptyBorders.borderRight).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      });
    });
  });

  describe('エッジケースとエラー処理', () => {
    describe('グリッドサイズの境界', () => {
      it('1x1グリッド', () => {
        const grid = createGrid(1, 1);
        const borders = calculateEmptyCellBorders(0, 0, grid);

        // 全方向がグリッド外
        expect(borders.borderTop).toBe(`1px solid ${COLORS.GRID_BORDER}`);
        expect(borders.borderRight).toBe(`1px solid ${COLORS.GRID_BORDER}`);
        expect(borders.borderBottom).toBe(`1px solid ${COLORS.GRID_BORDER}`);
        expect(borders.borderLeft).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      });

      it('1x10長方形グリッド', () => {
        const cell = createTestCell('SL001', '長方形', 'A1', 'J1');
        const grid = createGrid(1, 10);
        placeCell(grid, cell, 0, 0, 0, 9);

        const borders = calculateAllBorders(cell, { row: 0, col: 0 }, { row: 0, col: 9 }, grid);

        // グリッド端では青いグループ境界線
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });

      it('10x1長方形グリッド', () => {
        const cell = createTestCell('SL001', '長方形', 'A1', 'A10');
        const grid = createGrid(10, 1);
        placeCell(grid, cell, 0, 0, 9, 0);

        const borders = calculateAllBorders(cell, { row: 0, col: 0 }, { row: 9, col: 0 }, grid);

        // グリッド端では青いグループ境界線
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });

    describe('異常なデータ処理', () => {
      it('storageLocationCdがnullの場合', () => {
        const cell = { ...createTestCell('SL001'), storageLocationCd: null as any };
        const grid = createGrid(3, 3);
        placeCell(grid, cell, 1, 1, 1, 1);

        const borders = calculateAllBorders(cell, { row: 1, col: 1 }, { row: 1, col: 1 }, grid);

        // nullは通路セル扱いで青いグループ境界線
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });

      it('storageLocationCdが空白のみの場合', () => {
        const cell = createTestCell('   \t  ');
        const grid = createGrid(3, 3);
        placeCell(grid, cell, 1, 1, 1, 1);

        const borders = calculateAllBorders(cell, { row: 1, col: 1 }, { row: 1, col: 1 }, grid);

        // 空白のみは通路セル扱いで青いグループ境界線
        expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });
  });

  describe('パフォーマンステスト', () => {
    it('大型グリッド（20x20）での境界線計算', () => {
      const grid = createGrid(20, 20);
      
      // 大型セルを複数配置
      const cell1 = createTestCell('SL001', '大型1', 'A1', 'J10');
      const cell2 = createTestCell('SL002', '大型2', 'K1', 'T10');
      const cell3 = createTestCell('SL003', '大型3', 'A11', 'J20');
      const cell4 = createTestCell('SL004', '大型4', 'K11', 'T20');
      
      placeCell(grid, cell1, 0, 0, 9, 9);
      placeCell(grid, cell2, 0, 10, 9, 19);
      placeCell(grid, cell3, 10, 0, 19, 9);
      placeCell(grid, cell4, 10, 10, 19, 19);

      const startTime = performance.now();
      
      // 複数の境界線計算を実行
      const borders1 = calculateAllBorders(cell1, { row: 0, col: 0 }, { row: 9, col: 9 }, grid);
      const borders2 = calculateAllBorders(cell2, { row: 0, col: 10 }, { row: 9, col: 19 }, grid);
      const borders3 = calculateAllBorders(cell3, { row: 10, col: 0 }, { row: 19, col: 9 }, grid);
      const borders4 = calculateAllBorders(cell4, { row: 10, col: 10 }, { row: 19, col: 19 }, grid);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // パフォーマンス要件: 100ms以下で完了
      expect(duration).toBeLessThan(100);
      
      // 境界線が正しく計算されているか確認
      expect(borders1.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders1.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });
});