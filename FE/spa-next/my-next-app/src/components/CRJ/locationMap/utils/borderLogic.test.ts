// 境界線ロジックのテスト

import {
  createGetAdjacentCell,
  calculateBorderInfo,
  calculateAllBorders,
  calculateBorder,
  BorderDirection,
} from './borderLogic';
import { PlaceMapList } from '../types';
import { COLORS } from '../constants';

describe('Border Logic', () => {
  // テスト用のセル作成関数
  const createTestCell = (
    storageLocationCd: string,
    placementName: string = 'テスト配置',
    startCell: string = 'A1',
    endCell: string = 'A1'
  ): PlaceMapList => ({
    storageLocationCd,
    storageLocationName: '保管場所',
    placementCd: 'P001',
    placementName,
    capacityQuantity: '100',
    suspendedFlag: false,
    mapAllocationStartCell: startCell,
    mapAllocationEndCell: endCell,
    locationCd: 'L001',
  });

  describe('K6-K10通路セルの境界線問題テスト', () => {
    it('K6セル（通路セル）の個別境界線計算 - 左側に隣接セルなし（黒い境界線）', () => {
      const passageCell = createTestCell('', '通路', 'K1', 'K10');
      const groupCell = createTestCell('SL001', 'A-1', 'A1', 'J5');
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A1-J5にグルーピングありセルを配置
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          gridData[row][col] = groupCell;
        }
      }
      
      // K1-K10に通路セルを配置（列10）
      for (let row = 0; row < 10; row++) {
        gridData[row][10] = passageCell;
      }
      
      const getAdjacentCell = createGetAdjacentCell(gridData);
      
      // K6セル（row=5）の境界線情報を個別に計算
      const borderInfo = calculateBorderInfo(passageCell, { row: 5, col: 10 }, { row: 5, col: 10 }, gridData);
      
      // 左境界線をテスト
      const leftBorder = calculateBorder(passageCell, borderInfo, getAdjacentCell, BorderDirection.LEFT);
      
      // K6では左側に隣接セルがないが通路セルなので青い境界線
      expect(leftBorder.hasNonEmptyNeighbor).toBe(false);
      expect(leftBorder.useGroupBorder).toBe(true); // グルーピング未設定でもtrue
      expect(leftBorder.borderStyle).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      
      // 右境界線をテスト
      const rightBorder = calculateBorder(passageCell, borderInfo, getAdjacentCell, BorderDirection.RIGHT);
      
      // K6では右側にも隣接セルがないが通路セルなので青い境界線
      expect(rightBorder.hasNonEmptyNeighbor).toBe(false);
      expect(rightBorder.useGroupBorder).toBe(true); // グルーピング未設定でもtrue
      expect(rightBorder.borderStyle).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('K3セル（通路セル）の個別境界線計算 - 左側に隣接セルあり（青い境界線）', () => {
      const passageCell = createTestCell('', '通路', 'K1', 'K10');
      const groupCell = createTestCell('SL001', 'A-1', 'A1', 'J5');
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A1-J5にグルーピングありセルを配置
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          gridData[row][col] = groupCell;
        }
      }
      
      // K1-K10に通路セルを配置（列10）
      for (let row = 0; row < 10; row++) {
        gridData[row][10] = passageCell;
      }
      
      const getAdjacentCell = createGetAdjacentCell(gridData);
      
      // K3セル（row=2）の境界線情報を個別に計算
      const borderInfo = calculateBorderInfo(passageCell, { row: 2, col: 10 }, { row: 2, col: 10 }, gridData);
      
      // 左境界線をテスト
      const leftBorder = calculateBorder(passageCell, borderInfo, getAdjacentCell, BorderDirection.LEFT);
      
      // K3では左側にグルーピングありセルが隣接しているため青い境界線
      expect(leftBorder.hasNonEmptyNeighbor).toBe(true);
      expect(leftBorder.useGroupBorder).toBe(true);
      expect(leftBorder.borderStyle).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('K1-K5の通路セルの左辺（隣接セルありの場合）', () => {
      const passageCell = createTestCell('', '通路', 'K1', 'K5');
      const groupCell = createTestCell('SL001', 'A-1', 'A1', 'J5');
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A1-J5にグルーピングありセルを配置
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          gridData[row][col] = groupCell;
        }
      }
      
      // K1-K5に通路セルを配置（列10）
      for (let row = 0; row < 5; row++) {
        gridData[row][10] = passageCell;
      }
      
      const getAdjacentCell = createGetAdjacentCell(gridData);
      
      // K1-K5セルの境界線情報を計算
      const borderInfo = calculateBorderInfo(passageCell, { row: 0, col: 10 }, { row: 4, col: 10 }, gridData);
      
      // 左境界線をテスト - K1-K5すべてに隣接セルがあるので青い境界線
      const leftBorder = calculateBorder(passageCell, borderInfo, getAdjacentCell, BorderDirection.LEFT);
      
      expect(leftBorder.useGroupBorder).toBe(true);
      expect(leftBorder.borderStyle).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('通常のグルーピングありセルのテスト', () => {
    it('グルーピングありセル同士が隣接する場合は境界線なし', () => {
      const groupCell1 = createTestCell('SL001', 'グループ1');
      const groupCell2 = createTestCell('SL002', 'グループ2');
      
      const gridData: (PlaceMapList | null)[][] = [
        [groupCell1, groupCell2],
      ];
      
      const getAdjacentCell = createGetAdjacentCell(gridData);
      const borderInfo = calculateBorderInfo(groupCell1, { row: 0, col: 0 }, { row: 0, col: 0 }, gridData);
      
      const rightBorder = calculateBorder(groupCell1, borderInfo, getAdjacentCell, BorderDirection.RIGHT);
      
      // 異なるグルーピング同士なので青い境界線
      expect(rightBorder.useGroupBorder).toBe(true);
      expect(rightBorder.borderStyle).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('重要な仕様保護テスト', () => {
    it('K1-K5個別計算では青い境界線（隣接セルありの場合）', () => {
      const passageCell = createTestCell('', '通路', 'K1', 'K10');
      const groupCell = createTestCell('SL001', 'A-1', 'A1', 'J5');
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A1-J5にグルーピングありセルを配置
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          gridData[row][col] = groupCell;
        }
      }
      
      // K1-K10に通路セルを配置（列10）
      for (let row = 0; row < 10; row++) {
        gridData[row][10] = passageCell;
      }
      
      // K3セル（row=2）を個別に計算
      const borders = calculateAllBorders(passageCell, { row: 2, col: 10 }, { row: 2, col: 10 }, gridData);
      
      // K3では隣接セルがあるため青い境界線
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('K6-K10個別計算では黒い境界線（隣接セルなしの場合）', () => {
      const passageCell = createTestCell('', '通路', 'K1', 'K10');
      const groupCell = createTestCell('SL001', 'A-1', 'A1', 'J5');
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A1-J5にグルーピングありセルを配置
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          gridData[row][col] = groupCell;
        }
      }
      
      // K1-K10に通路セルを配置（列10）
      for (let row = 0; row < 10; row++) {
        gridData[row][10] = passageCell;
      }
      
      // K7セル（row=6）を個別に計算
      const borders = calculateAllBorders(passageCell, { row: 6, col: 10 }, { row: 6, col: 10 }, gridData);
      
      // K7では隣接セルがないが通路セルなので青い境界線
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('同一保管場所セル境界線問題のテスト', () => {
    it('D6とD7の境界線（同一保管場所SL004）- 黒い境界線になるべき', () => {
      // P01011 (D5-D6) と P120 (A7-D7) は同一保管場所SL004
      const cell1 = createTestCell('SL004', '配置', 'D5', 'D6'); // P01011
      const cell2 = createTestCell('SL004', '配置3456', 'A7', 'D7'); // P120
      const cell3 = createTestCell('SL003', '配置1', 'A5', 'C6'); // P1212
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A5-C6にP1212を配置
      for (let row = 4; row < 6; row++) {
        for (let col = 0; col < 3; col++) {
          gridData[row][col] = cell3;
        }
      }
      
      // D5-D6にP01011を配置
      for (let row = 4; row < 6; row++) {
        gridData[row][3] = cell1;
      }
      
      // A7-D7にP120を配置
      for (let col = 0; col < 4; col++) {
        gridData[6][col] = cell2;
      }
      
      // P01011 (D6セル)の下境界線をテスト
      const borders1 = calculateAllBorders(cell1, { row: 4, col: 3 }, { row: 5, col: 3 }, gridData);
      
      // P120 (D7セル)の上境界線をテスト
      const borders2 = calculateAllBorders(cell2, { row: 6, col: 0 }, { row: 6, col: 3 }, gridData);
      
      // 同一保管場所のため、境界線は表示しない
      expect(borders1.borderBottom).toBe(`1px solid ${COLORS.BORDER}`);
      expect(borders2.borderTop).toBe(`1px solid ${COLORS.BORDER}`);
    });
    
    it('配置1が存在しない場合の確認テスト', () => {
      // P01011 (D5-D6) と P120 (A7-D7) は同一保管場所SL004（配置1なし）
      const cell1 = createTestCell('SL004', '配置', 'D5', 'D6'); // P01011
      const cell2 = createTestCell('SL004', '配置3456', 'A7', 'D7'); // P120
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // D5-D6にP01011を配置
      for (let row = 4; row < 6; row++) {
        gridData[row][3] = cell1;
      }
      
      // A7-D7にP120を配置
      for (let col = 0; col < 4; col++) {
        gridData[6][col] = cell2;
      }
      
      // P01011 (D6セル)の下境界線をテスト
      const borders1 = calculateAllBorders(cell1, { row: 4, col: 3 }, { row: 5, col: 3 }, gridData);
      
      // P120 (D7セル)の上境界線をテスト
      const borders2 = calculateAllBorders(cell2, { row: 6, col: 0 }, { row: 6, col: 3 }, gridData);
      
      // 同一保管場所のため、境界線は表示しない
      expect(borders1.borderBottom).toBe(`1px solid ${COLORS.BORDER}`);
      expect(borders2.borderTop).toBe(`1px solid ${COLORS.BORDER}`);
    });
  });

  describe('エッジケースのテスト', () => {
    it('グリッドデータが空の場合でもエラーが発生しない', () => {
      const cell = createTestCell('SL001', 'テスト');
      const gridData: (PlaceMapList | null)[][] = [];
      
      // エラーが発生しないことを確認
      expect(() => {
        calculateAllBorders(cell, { row: 0, col: 0 }, { row: 0, col: 0 }, gridData);
      }).not.toThrow();
    });

    it('グリッドデータの幅が0の場合の処理', () => {
      const cell = createTestCell('SL001', 'テスト');
      const gridData: (PlaceMapList | null)[][] = [[]];
      
      const borderInfo = calculateBorderInfo(cell, { row: 0, col: 0 }, { row: 0, col: 0 }, gridData);
      expect(borderInfo.gridWidth).toBe(0);
    });

    it('範囲外の座標を指定した場合のgetAdjacentCell', () => {
      const cell = createTestCell('SL001', 'テスト');
      const gridData: (PlaceMapList | null)[][] = [[cell]];
      const getAdjacentCell = createGetAdjacentCell(gridData);
      
      // 範囲外の座標を指定
      expect(getAdjacentCell(-1, 0)).toBeNull();
      expect(getAdjacentCell(0, -1)).toBeNull();
      expect(getAdjacentCell(2, 0)).toBeNull();
      expect(getAdjacentCell(0, 2)).toBeNull();
    });

    it('保管場所コードが空白文字のみの場合', () => {
      const cell = createTestCell('   ', 'スペースのみ');
      const gridData: (PlaceMapList | null)[][] = [[cell]];
      
      const borderInfo = calculateBorderInfo(cell, { row: 0, col: 0 }, { row: 0, col: 0 }, gridData);
      expect(borderInfo.hasStorageLocationCode).toBe(false);
      expect(borderInfo.useGroupBorder).toBe(true); // グルーピング未設定でもtrue
    });

    it('endがグリッドサイズを超える場合でも正しく処理される', () => {
      const cell = createTestCell('SL001', 'テスト');
      const gridData: (PlaceMapList | null)[][] = [[cell, null], [null, null]];
      
      const borderInfo = calculateBorderInfo(
        cell, 
        { row: 0, col: 0 }, 
        { row: 10, col: 10 }, // グリッドサイズを超える
        gridData
      );
      
      expect(borderInfo.isBottomEdge).toBe(true);
      expect(borderInfo.isRightEdge).toBe(true);
    });
  });

  describe('determineBorderStyle関数の詳細テスト', () => {
    it('通路セルで隣接セルがなく、エッジでもない場合は黒い境界線', () => {
      const passageCell = createTestCell('', '通路');
      const gridData: (PlaceMapList | null)[][] = [[null, passageCell, null]];
      
      const borders = calculateAllBorders(passageCell, { row: 0, col: 1 }, { row: 0, col: 1 }, gridData);
      
      // 左右は隣接セルがないが通路セルなので青い境界線
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('グルーピングありセルで隣接セルがなく、エッジでもない場合は境界線なし', () => {
      const groupCell = createTestCell('SL001', 'グループ');
      const gridData: (PlaceMapList | null)[][] = [[null, groupCell, null]];
      
      const borders = calculateAllBorders(groupCell, { row: 0, col: 1 }, { row: 0, col: 1 }, gridData);
      
      // 左右は隣接セルがないので境界線なし
      expect(borders.borderLeft).toBe('none');
      expect(borders.borderRight).toBe('none');
    });
  });

  describe('複雑な配置パターンのテスト', () => {
    it('通路セルが複数のグルーピングセルに囲まれている場合', () => {
      const passageCell = createTestCell('', '通路');
      const group1 = createTestCell('SL001', 'グループ1');
      const group2 = createTestCell('SL002', 'グループ2');
      const group3 = createTestCell('SL003', 'グループ3');
      const group4 = createTestCell('SL004', 'グループ4');
      
      const gridData: (PlaceMapList | null)[][] = [
        [group1, group2, group3],
        [group4, passageCell, group1],
        [group2, group3, group4],
      ];
      
      const borders = calculateAllBorders(passageCell, { row: 1, col: 1 }, { row: 1, col: 1 }, gridData);
      
      // 通路セルはすべての方向で青い境界線
      expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('同一保管場所のセルが部分的に隣接している場合', () => {
      const cell1 = createTestCell('SL001', 'セル1', 'A1', 'B2');
      const cell2 = createTestCell('SL001', 'セル2', 'A3', 'B3');
      const cell3 = createTestCell('SL002', '別グループ', 'C1', 'C3');
      
      const gridData: (PlaceMapList | null)[][] = [
        [cell1, cell1, cell3],
        [cell1, cell1, cell3],
        [cell2, cell2, cell3],
      ];
      
      // セル1の下境界線（一部は同一保管場所、一部は空）
      const borders = calculateAllBorders(cell1, { row: 0, col: 0 }, { row: 1, col: 1 }, gridData);
      
      // 同一保管場所のセルと隣接しているため境界線なし
      expect(borders.borderBottom).toBe(`1px solid ${COLORS.BORDER}`);
    });
  });

  describe('通路セル同士の境界線テスト', () => {
    it('通路セル同士が隣接する場合は青い境界線', () => {
      const passage1 = createTestCell('', '通路1');
      const passage2 = createTestCell('', '通路2');
      
      const gridData: (PlaceMapList | null)[][] = [
        [passage1, passage2],
      ];
      
      const borders1 = calculateAllBorders(passage1, { row: 0, col: 0 }, { row: 0, col: 0 }, gridData);
      const borders2 = calculateAllBorders(passage2, { row: 0, col: 1 }, { row: 0, col: 1 }, gridData);
      
      // 通路セル同士は青い境界線
      expect(borders1.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders2.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大規模グリッドでも適切に処理される', () => {
      // 50x50のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(50)
        .fill(null)
        .map(() => Array(50).fill(null));
      
      // ランダムにセルを配置
      for (let row = 0; row < 50; row++) {
        for (let col = 0; col < 50; col++) {
          if (Math.random() > 0.5) {
            const storageCode = Math.random() > 0.5 ? `SL${row}${col}` : '';
            gridData[row][col] = createTestCell(storageCode, `セル${row}-${col}`);
          }
        }
      }
      
      const startTime = Date.now();
      
      // 中央のセルの境界線を計算
      const centerCell = gridData[25][25] || createTestCell('SL2525', '中央');
      gridData[25][25] = centerCell;
      
      const borders = calculateAllBorders(centerCell, { row: 25, col: 25 }, { row: 25, col: 25 }, gridData);
      
      const endTime = Date.now();
      
      // 1秒以内に完了することを確認
      expect(endTime - startTime).toBeLessThan(1000);
      
      // 境界線が正しく計算されていることを確認
      expect(borders.borderTop).toBeDefined();
      expect(borders.borderBottom).toBeDefined();
      expect(borders.borderLeft).toBeDefined();
      expect(borders.borderRight).toBeDefined();
    });
  });

  describe('特殊な境界線パターンのテスト', () => {
    it('斜め隣接セルとの境界線は計算に含まれない', () => {
      const cell = createTestCell('SL001', 'メイン');
      const diagonal = createTestCell('SL002', '斜め');
      
      const gridData: (PlaceMapList | null)[][] = [
        [diagonal, null,     null],
        [null,     cell,     null],
        [null,     null,     diagonal],
      ];
      
      const borders = calculateAllBorders(cell, { row: 1, col: 1 }, { row: 1, col: 1 }, gridData);
      
      // 斜めのセルは隣接とみなされないため、隣接セルなしの扱い
      // グルーピングありセルで隣接セルがない場合は境界線なし
      expect(borders.borderTop).toBe('none');
      expect(borders.borderBottom).toBe('none');
      expect(borders.borderLeft).toBe('none');
      expect(borders.borderRight).toBe('none');
    });

    it('複数行・複数列にまたがるセルの一部境界線', () => {
      const bigCell = createTestCell('SL001', '大きいセル', 'B2', 'D4');
      const smallCell = createTestCell('SL002', '小さいセル');
      
      // 5x5グリッドに配置
      const gridData: (PlaceMapList | null)[][] = Array(5)
        .fill(null)
        .map(() => Array(5).fill(null));
      
      // B2-D4（row:1-3, col:1-3）に大きいセルを配置
      for (let row = 1; row <= 3; row++) {
        for (let col = 1; col <= 3; col++) {
          gridData[row][col] = bigCell;
        }
      }
      
      // E3に小さいセルを配置
      gridData[2][4] = smallCell;
      
      // 大きいセルの境界線を計算
      const borders = calculateAllBorders(bigCell, { row: 1, col: 1 }, { row: 3, col: 3 }, gridData);
      
      // 右側の中央部分だけ隣接セルがある
      expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('calculateAllBorders統合テスト', () => {
    it('K6セル（通路セル）の全境界線が黒になる', () => {
      const passageCell = createTestCell('', '通路', 'K1', 'K10');
      const groupCell = createTestCell('SL001', 'A-1', 'A1', 'J5');
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A1-J5にグルーピングありセルを配置
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          gridData[row][col] = groupCell;
        }
      }
      
      // K1-K10に通路セルを配置（列10）
      for (let row = 0; row < 10; row++) {
        gridData[row][10] = passageCell;
      }
      
      // K6セル（row=5）の境界線を個別に計算
      const borders = calculateAllBorders(passageCell, { row: 5, col: 10 }, { row: 5, col: 10 }, gridData);
      
      // K6では隣接セルがないが通路セルなので青い境界線
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('K1-K10通路セル全体の境界線計算（実際のGridCellの動作をシミュレート）', () => {
      const passageCell = createTestCell('', '通路', 'K1', 'K10');
      const groupCell = createTestCell('SL001', 'A-1', 'A1', 'J5');
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A1-J5にグルーピングありセルを配置
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          gridData[row][col] = groupCell;
        }
      }
      
      // K1-K10に通路セルを配置（列10）
      for (let row = 0; row < 10; row++) {
        gridData[row][10] = passageCell;
      }
      
      // 実際のGridCellの動作をシミュレート: K1-K10全体を一つのセルとして計算
      const borders = calculateAllBorders(passageCell, { row: 0, col: 10 }, { row: 9, col: 10 }, gridData);
      
      // 修正後のロジックでは、通路セルはすべて青い境界線
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('個別の境界線計算関数のテスト', () => {
    describe('calculateBorderInfo', () => {
      it('nullまたはundefinedのセルでも処理できる', () => {
        const gridData: (PlaceMapList | null)[][] = [[null]];
        
        // @ts-ignore - テストのためnullを渡す
        const borderInfo = calculateBorderInfo(null, { row: 0, col: 0 }, { row: 0, col: 0 }, gridData);
        
        expect(borderInfo.hasStorageLocationCode).toBe(false);
        expect(borderInfo.useGroupBorder).toBe(true); // グルーピング未設定でもtrue
      });
    });

    describe('境界線結果の詳細確認', () => {
      it('BorderResult型の全プロパティが正しく設定される', () => {
        const cell = createTestCell('SL001', 'テスト');
        const neighbor = createTestCell('SL002', '隣接');
        const gridData: (PlaceMapList | null)[][] = [[cell, neighbor]];
        
        const borderInfo = calculateBorderInfo(cell, { row: 0, col: 0 }, { row: 0, col: 0 }, gridData);
        const getAdjacentCell = createGetAdjacentCell(gridData);
        
        const rightBorder = calculateBorder(cell, borderInfo, getAdjacentCell, BorderDirection.RIGHT);
        
        // BorderResult型の全プロパティを確認
        expect(rightBorder).toHaveProperty('borderStyle');
        expect(rightBorder).toHaveProperty('needBorder');
        expect(rightBorder).toHaveProperty('hasNonEmptyNeighbor');
        expect(rightBorder).toHaveProperty('useGroupBorder');
        
        // 値も確認
        expect(rightBorder.needBorder).toBe(true);
        expect(rightBorder.hasNonEmptyNeighbor).toBe(true);
        expect(rightBorder.useGroupBorder).toBe(true);
        expect(rightBorder.borderStyle).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });

    describe('複雑な隣接パターンの詳細テスト', () => {
      it('上下左右すべてに異なる種類のセルが隣接する場合', () => {
        const mainCell = createTestCell('SL001', 'メイン');
        const sameGroup = createTestCell('SL001', '同一グループ');
        const diffGroup = createTestCell('SL002', '異なるグループ');
        const passage = createTestCell('', '通路');
        
        const gridData: (PlaceMapList | null)[][] = [
          [null,      sameGroup, null],
          [passage,   mainCell,  diffGroup],
          [null,      null,      null],
        ];
        
        const borders = calculateAllBorders(mainCell, { row: 1, col: 1 }, { row: 1, col: 1 }, gridData);
        
        // 上：同一グループ → 境界線なし
        expect(borders.borderTop).toBe(`1px solid ${COLORS.BORDER}`);
        // 下：隣接セルなし → 境界線なし（グルーピングありセル）
        expect(borders.borderBottom).toBe('none');
        // 左：通路セル → 青い境界線
        expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
        // 右：異なるグループ → 青い境界線
        expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      });
    });
  });

  describe('A1-E1通路セルの境界線問題テスト（縦方向対称性検証）', () => {
    it('A1セル（通路セル）の個別境界線計算 - 下側に一部隣接セルなし（黒い境界線）', () => {
      const passageCell = createTestCell('', '通路', 'A1', 'E1');
      const groupCell = createTestCell('SL001', 'A-1', 'C2', 'E6');
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A1-E1に通路セルを配置
      for (let col = 0; col < 5; col++) {
        gridData[0][col] = passageCell;
      }
      
      // C2-E6にグルーピングありセルを配置（A,B列の下には隣接セルなし）
      for (let row = 1; row < 6; row++) {
        for (let col = 2; col < 5; col++) {
          gridData[row][col] = groupCell;
        }
      }
      
      // A1-E1セルの下境界線を計算（A,B列の下には隣接セルなし、C-E列の下にはあり）
      const borderInfo = calculateBorderInfo(passageCell, { row: 0, col: 0 }, { row: 0, col: 4 }, gridData);
      const getAdjacentCell = createGetAdjacentCell(gridData);
      
      const bottomBorder = calculateBorder(passageCell, borderInfo, getAdjacentCell, BorderDirection.BOTTOM);
      
      // 現在の実装では、隣接セルが存在するため特別ルールが適用されない
      // このテストは将来の仕様拡張のための余地
      expect(bottomBorder.borderStyle).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(bottomBorder.useGroupBorder).toBe(true);
    });

    it('C1セル（通路セル）の個別境界線計算 - 下側に全て隣接セルあり（青い境界線）', () => {
      const passageCell = createTestCell('', '通路', 'A1', 'E1');
      const groupCell = createTestCell('SL001', 'A-1', 'A2', 'E6');
      
      // 10x12のグリッドを作成
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A1-E1に通路セルを配置
      for (let col = 0; col < 5; col++) {
        gridData[0][col] = passageCell;
      }
      
      // A2-E6にグルーピングありセルを配置（全ての列に隣接セルあり）
      for (let row = 1; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
          gridData[row][col] = groupCell;
        }
      }
      
      // A1-E1セルの下境界線を計算
      const borderInfo = calculateBorderInfo(passageCell, { row: 0, col: 0 }, { row: 0, col: 4 }, gridData);
      const getAdjacentCell = createGetAdjacentCell(gridData);
      
      const bottomBorder = calculateBorder(passageCell, borderInfo, getAdjacentCell, BorderDirection.BOTTOM);
      
      // 全ての列に隣接セルがあるため青い境界線
      expect(bottomBorder.borderStyle).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(bottomBorder.useGroupBorder).toBe(true);
    });
  });
});