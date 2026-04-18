// EmptyCell境界線ロジックのテスト

import {
  createGetAdjacentCellForEmpty,
  hasGrouping,
  calculateEmptyCellBorderStyle,
  calculateEmptyCellBorders,
  AdjacentCell,
} from './emptyCellBorderLogic';
import { PlaceMapList } from '../types';
import { COLORS } from '../constants';

describe('EmptyCell Border Logic', () => {
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

  describe('createGetAdjacentCellForEmpty', () => {
    it('グリッド内のセルを正しく取得する', () => {
      const grid: (PlaceMapList | null)[][] = [[createTestCell('SL001')]];
      const getAdjacentCell = createGetAdjacentCellForEmpty(grid, 1, 1);
      
      expect(getAdjacentCell(0, 0)).toEqual(grid[0][0]);
    });

    it('グリッド外の場合はoutsideを返す', () => {
      const grid: (PlaceMapList | null)[][] = [[null]];
      const getAdjacentCell = createGetAdjacentCellForEmpty(grid, 1, 1);
      
      expect(getAdjacentCell(-1, 0)).toBe('outside');
      expect(getAdjacentCell(0, -1)).toBe('outside');
      expect(getAdjacentCell(1, 0)).toBe('outside');
      expect(getAdjacentCell(0, 1)).toBe('outside');
    });

    it('空セルの場合はnullを返す', () => {
      const grid: (PlaceMapList | null)[][] = [[null]];
      const getAdjacentCell = createGetAdjacentCellForEmpty(grid, 1, 1);
      
      expect(getAdjacentCell(0, 0)).toBeNull();
    });

    it('開始セルでない場合でもセルを返す', () => {
      const cell = createTestCell('SL001', '配置1', 'A1', 'B2');
      const grid: (PlaceMapList | null)[][] = [
        [cell, cell],
        [cell, cell]
      ];
      const getAdjacentCell = createGetAdjacentCellForEmpty(grid, 2, 2);
      
      // B2は開始セルではないが、セルは返される
      expect(getAdjacentCell(1, 1)).toEqual(cell);
    });
  });

  describe('hasGrouping', () => {
    it('storageLocationCdが存在する場合はtrueを返す', () => {
      const cell = createTestCell('SL001');
      expect(hasGrouping(cell)).toBe(true);
    });

    it('storageLocationCdが空文字の場合はfalseを返す', () => {
      const cell = createTestCell('');
      expect(hasGrouping(cell)).toBe(false);
    });

    it('storageLocationCdが空白のみの場合はfalseを返す', () => {
      const cell = createTestCell('   \t  ');
      expect(hasGrouping(cell)).toBe(false);
    });

    it('nullの場合はfalseを返す', () => {
      expect(hasGrouping(null)).toBe(false);
    });

    it('outsideの場合はfalseを返す', () => {
      expect(hasGrouping('outside')).toBe(false);
    });
  });

  describe('calculateEmptyCellBorderStyle', () => {
    it('グルーピングありセルに隣接する場合は青い境界線', () => {
      const cell = createTestCell('SL001');
      const style = calculateEmptyCellBorderStyle(cell);
      
      expect(style).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('通路セル（グルーピングなし）に隣接する場合も青い境界線', () => {
      const cell = createTestCell('', '通路');
      const style = calculateEmptyCellBorderStyle(cell);
      
      expect(style).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('空セルに隣接する場合は黒い境界線', () => {
      const style = calculateEmptyCellBorderStyle(null);
      
      expect(style).toBe(`1px solid ${COLORS.GRID_BORDER}`);
    });

    it('グリッド外に隣接する場合は黒い境界線', () => {
      const style = calculateEmptyCellBorderStyle('outside');
      
      expect(style).toBe(`1px solid ${COLORS.GRID_BORDER}`);
    });
  });

  describe('calculateEmptyCellBorders', () => {
    it('全方向がグルーピングありセルの場合', () => {
      const groupCell = createTestCell('SL001');
      const grid: (PlaceMapList | null)[][] = [
        [groupCell, groupCell, groupCell],
        [groupCell, null, groupCell],
        [groupCell, groupCell, groupCell],
      ];
      
      const borders = calculateEmptyCellBorders(1, 1, grid);
      
      expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('全方向が通路セルの場合', () => {
      const passageCell = createTestCell('', '通路');
      const grid: (PlaceMapList | null)[][] = [
        [passageCell, passageCell, passageCell],
        [passageCell, null, passageCell],
        [passageCell, passageCell, passageCell],
      ];
      
      const borders = calculateEmptyCellBorders(1, 1, grid);
      
      expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('混在する場合', () => {
      const groupCell = createTestCell('SL001');
      const passageCell = createTestCell('', '通路');
      const grid: (PlaceMapList | null)[][] = [
        [groupCell, passageCell, null],
        [groupCell, null, passageCell],
        [null, passageCell, groupCell],
      ];
      
      const borders = calculateEmptyCellBorders(1, 1, grid);
      
      expect(borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 常にグループ境界線
      expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 常にグループ境界線
      expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 常にグループ境界線
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 常にグループ境界線
    });

    it('グリッドの端の空セル', () => {
      const groupCell = createTestCell('SL001');
      const grid: (PlaceMapList | null)[][] = [
        [null, groupCell],
        [groupCell, groupCell],
      ];
      
      const borders = calculateEmptyCellBorders(0, 0, grid);
      
      expect(borders.borderTop).toBe(`1px solid ${COLORS.GRID_BORDER}`); // グリッド外
      expect(borders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // グルーピングあり
      expect(borders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // グルーピングあり
      expect(borders.borderLeft).toBe(`1px solid ${COLORS.GRID_BORDER}`); // グリッド外
    });
  });

  describe('CSVテストケースのシミュレーション', () => {
    it('K6-K10の右側の空セル（通路セルに隣接）', () => {
      const passageCell = createTestCell('', '通路', 'K1', 'K10');
      const grid: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // K列（列10）に通路セルを配置
      for (let row = 0; row < 10; row++) {
        grid[row][10] = passageCell;
      }
      
      // K6（行5）の右側の空セル（列11）の境界線を計算
      const borders = calculateEmptyCellBorders(5, 11, grid);
      
      // 左側は通路セルに隣接しているため青い境界線、他は空なので黒い境界線
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderTop).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      expect(borders.borderRight).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      expect(borders.borderBottom).toBe(`1px solid ${COLORS.GRID_BORDER}`);
    });

    it('K1-K5の右側の空セル（通路セルに隣接、グルーピングありセルが近接）', () => {
      const passageCell = createTestCell('', '通路', 'K1', 'K10');
      const groupCell = createTestCell('SL001', 'A-1', 'A1', 'J5');
      const grid: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A1-J5にグルーピングありセルを配置
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          grid[row][col] = groupCell;
        }
      }
      
      // K列（列10）に通路セルを配置
      for (let row = 0; row < 10; row++) {
        grid[row][10] = passageCell;
      }
      
      // K3（行2）の右側の空セル（列11）の境界線を計算
      const borders = calculateEmptyCellBorders(2, 11, grid);
      
      // 左側は通路セルに隣接しているため青い境界線、他は空なので黒い境界線
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(borders.borderTop).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      expect(borders.borderRight).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      expect(borders.borderBottom).toBe(`1px solid ${COLORS.GRID_BORDER}`);
    });

    it('グルーピングありセルの右側の空セル', () => {
      const groupCell = createTestCell('SL001', 'A-1', 'A1', 'J1');
      const grid: (PlaceMapList | null)[][] = Array(5)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // A-J列（列0-9）にグルーピングありセルを配置
      for (let col = 0; col < 10; col++) {
        grid[0][col] = groupCell;
      }
      
      // J1（列9）の右側の空セル（列10）の境界線を計算
      const borders = calculateEmptyCellBorders(0, 10, grid);
      
      // 左側はグルーピングありセルに隣接しているため青い境界線
      expect(borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('Edge Cases', () => {
    it('0x0グリッドでの処理', () => {
      const grid: (PlaceMapList | null)[][] = [];
      
      // エラーにならずに処理される
      expect(() => calculateEmptyCellBorders(0, 0, grid)).not.toThrow();
    });

    it('1x1グリッドでの処理', () => {
      const grid: (PlaceMapList | null)[][] = [[null]];
      const borders = calculateEmptyCellBorders(0, 0, grid);
      
      // 全方向がグリッド外なので黒い境界線
      expect(borders.borderTop).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      expect(borders.borderRight).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      expect(borders.borderBottom).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      expect(borders.borderLeft).toBe(`1px solid ${COLORS.GRID_BORDER}`);
    });

    it('storageLocationCdがnullの場合', () => {
      const cell = { ...createTestCell('SL001'), storageLocationCd: null as any };
      expect(hasGrouping(cell)).toBe(false);
    });

    it('storageLocationCdがundefinedの場合', () => {
      const cell = { ...createTestCell('SL001'), storageLocationCd: undefined as any };
      expect(hasGrouping(cell)).toBe(false);
    });
  });
});