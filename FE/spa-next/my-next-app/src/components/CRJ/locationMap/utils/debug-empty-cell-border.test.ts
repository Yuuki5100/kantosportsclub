// EmptyCellBorderLogicと修正後のborderLogicとの整合性確認

import { calculateEmptyCellBorders } from './emptyCellBorderLogic';
import { calculateAllBorders } from './borderLogic';
import { PlaceMapList } from '../types';
import { COLORS } from '../constants';

describe('EmptyCell vs GridCell 境界線一貫性テスト', () => {
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

  it('通路セルに隣接する空セルの境界線（現在の実装）', () => {
    const passageCell = createTestCell('', '通路');
    
    // 空セルが通路セルに隣接する場合
    const grid: (PlaceMapList | null)[][] = [
      [passageCell, null], // 通路セル、空セル
    ];
    
    // 空セル（0,1）の左境界線（通路セルに隣接）
    const emptyBorders = calculateEmptyCellBorders(0, 1, grid);

    expect(emptyBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // セルが存在するため青い境界線
  });

  it('通路セル自体の境界線（修正後の実装）', () => {
    const passageCell = createTestCell('', '通路');
    
    const grid: (PlaceMapList | null)[][] = [
      [passageCell, null], // 通路セル、空セル
    ];
    
    // 通路セル（0,0）の右境界線（空セルに隣接）
    const passageBorders = calculateAllBorders(passageCell, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);

    expect(passageBorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 修正後の実装
  });

  it('グルーピングセルに隣接する空セルの境界線', () => {
    const groupCell = createTestCell('SL001', 'グループ');
    
    const grid: (PlaceMapList | null)[][] = [
      [groupCell, null], // グループセル、空セル
    ];
    
    // 空セル（0,1）の左境界線（グループセルに隣接）
    const emptyBorders = calculateEmptyCellBorders(0, 1, grid);

    expect(emptyBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
  });

  it('グルーピングセル自体の境界線', () => {
    const groupCell = createTestCell('SL001', 'グループ');
    
    const grid: (PlaceMapList | null)[][] = [
      [groupCell, null], // グループセル、空セル
    ];
    
    // グループセル（0,0）の右境界線（空セルに隣接）
    const groupBorders = calculateAllBorders(groupCell, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);

    expect(groupBorders.borderRight).toBe('none'); // グループセルは隣接セルなしで境界線なし
  });

  it('現在の実装での境界線の非対称性', () => {
    // この例では、通路セルと空セルの間で境界線が非対称になる
    const passageCell = createTestCell('', '通路');
    
    const grid: (PlaceMapList | null)[][] = [
      [passageCell, null],
    ];
    
    const emptyBorders = calculateEmptyCellBorders(0, 1, grid);
    const passageBorders = calculateAllBorders(passageCell, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);

    // 現在の実装では両方とも青い境界線
    expect(emptyBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 青い境界線
    expect(passageBorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`); // 青い境界線
  });
});
