// 実世界の複雑なシナリオテスト - 実際の倉庫レイアウトパターンを検証

import {
  calculateAllBorders,
} from './borderLogic';
import {
  calculateEmptyCellBorders,
} from './emptyCellBorderLogic';
import { PlaceMapList } from '../types';
import { COLORS } from '../constants';

describe('Real-World Scenario Tests', () => {
  // テスト用のセル作成関数
  const createTestCell = (
    storageLocationCd: string,
    placementName: string = 'テスト配置',
    startCell: string = 'A1',
    endCell: string = 'A1',
    capacityQuantity: string = '100',
    suspendedFlag: boolean = false
  ): PlaceMapList => ({
    storageLocationCd,
    storageLocationName: storageLocationCd ? `保管場所${storageLocationCd}` : '',
    placementCd: `P${Math.random().toString(36).substr(2, 6)}`,
    placementName,
    capacityQuantity,
    suspendedFlag,
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

  describe('大規模倉庫レイアウト', () => {
    it('10x15グリッドの複合倉庫レイアウト', () => {
      const grid = createGrid(10, 15);
      
      // メインエリア（左側）
      const mainWarehouse = createTestCell('WH-MAIN', 'メイン倉庫', 'A1', 'H8');
      placeCell(grid, mainWarehouse, 0, 0, 7, 7);

      // 冷蔵エリア（右上）
      const coldStorage = createTestCell('WH-COLD', '冷蔵庫', 'I1', 'O5');
      placeCell(grid, coldStorage, 0, 8, 4, 14);

      // 危険物エリア（右下）
      const hazardous = createTestCell('WH-HAZ', '危険物', 'I6', 'O10');
      placeCell(grid, hazardous, 5, 8, 9, 14);

      // 中央通路（縦）
      const corridor1 = createTestCell('', '通路1', 'I9', 'I10');
      placeCell(grid, corridor1, 8, 8, 9, 8);

      // 横通路
      const corridor2 = createTestCell('', '通路2', 'A9', 'O9');
      placeCell(grid, corridor2, 8, 0, 8, 14);

      // 境界線テスト - メイン倉庫と冷蔵エリアの境界
      const mainBorders = calculateAllBorders(mainWarehouse, { row: 0, col: 0 }, { row: 7, col: 7 }, grid);
      const coldBorders = calculateAllBorders(coldStorage, { row: 0, col: 8 }, { row: 4, col: 14 }, grid);

      // 異なる保管場所同士は青い境界線
      expect(mainBorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(coldBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);

      // 通路との境界も青い境界線
      expect(mainBorders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('マルチレベル倉庫（階層構造シミュレーション）', () => {
      const grid = createGrid(12, 20);
      
      // 1階エリア
      const floor1A = createTestCell('F1-A', '1階A区画', 'A1', 'F10');
      const floor1B = createTestCell('F1-B', '1階B区画', 'G1', 'L10');
      const floor1C = createTestCell('F1-C', '1階C区画', 'M1', 'T10');

      // 2階エリア（同じ水平座標だが、論理的に別階層）
      const floor2A = createTestCell('F2-A', '2階A区画', 'A11', 'F12');
      const floor2B = createTestCell('F2-B', '2階B区画', 'G11', 'L12');

      // エレベーター・階段エリア
      const elevator = createTestCell('', 'EV', 'M11', 'O12');
      const stairs = createTestCell('', '階段', 'P11', 'T12');

      placeCell(grid, floor1A, 0, 0, 9, 5);
      placeCell(grid, floor1B, 0, 6, 9, 11);
      placeCell(grid, floor1C, 0, 12, 9, 19);
      placeCell(grid, floor2A, 10, 0, 11, 5);
      placeCell(grid, floor2B, 10, 6, 11, 11);
      placeCell(grid, elevator, 10, 12, 11, 14);
      placeCell(grid, stairs, 10, 15, 11, 19);

      // 境界線テスト
      const f1ABorders = calculateAllBorders(floor1A, { row: 0, col: 0 }, { row: 9, col: 5 }, grid);
      const f1BBorders = calculateAllBorders(floor1B, { row: 0, col: 6 }, { row: 9, col: 11 }, grid);
      const f2ABorders = calculateAllBorders(floor2A, { row: 10, col: 0 }, { row: 11, col: 5 }, grid);

      // 1階の異なる区画間は青い境界線
      expect(f1ABorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(f1BBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);

      // 階層間は青い境界線
      expect(f1ABorders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(f2ABorders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('特殊配置パターン', () => {
    it('工場レイアウト - 製造ライン配置', () => {
      const grid = createGrid(8, 16);
      
      // 製造ライン1（L字型）
      const line1A = createTestCell('LINE1', 'ライン1-前工程', 'A1', 'D8');
      const line1B = createTestCell('LINE1', 'ライン1-後工程', 'E1', 'H4');
      
      // 製造ライン2（直線型）
      const line2 = createTestCell('LINE2', 'ライン2', 'I1', 'P8');

      // 品質管理エリア
      const qc = createTestCell('QC', '品質管理', 'E5', 'H8');

      // 原材料保管
      const materials = createTestCell('MAT', '原材料', 'A9', 'H12');

      // 完成品保管
      const finished = createTestCell('FIN', '完成品', 'I9', 'P12');

      // 通路
      const mainCorridor = createTestCell('', 'メイン通路', 'A13', 'P16');

      placeCell(grid, line1A, 0, 0, 7, 3);
      placeCell(grid, line1B, 0, 4, 3, 7);
      placeCell(grid, line2, 0, 8, 7, 15);
      placeCell(grid, qc, 4, 4, 7, 7);
      placeCell(grid, materials, 8, 0, 11, 7);
      placeCell(grid, finished, 8, 8, 11, 15);
      placeCell(grid, mainCorridor, 12, 0, 15, 15);

      // 同一ライン内の境界線（ライン1）
      const line1ABorders = calculateAllBorders(line1A, { row: 0, col: 0 }, { row: 7, col: 3 }, grid);
      const line1BBorders = calculateAllBorders(line1B, { row: 0, col: 4 }, { row: 3, col: 7 }, grid);

      // 同一保管場所（LINE1）でも現在の実装では境界線がある
      expect(line1ABorders.borderRight).toBe(`1px solid ${COLORS.BORDER}`);
      expect(line1BBorders.borderLeft).toBe(`1px solid ${COLORS.BORDER}`);

      // 異なるライン間の境界線
      const line2Borders = calculateAllBorders(line2, { row: 0, col: 8 }, { row: 7, col: 15 }, grid);
      expect(line2Borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('小売店舗レイアウト - 商品陳列棚', () => {
      const grid = createGrid(12, 20);
      
      // 食品エリア
      const fresh = createTestCell('FRESH', '生鮮食品', 'A1', 'F6');
      const frozen = createTestCell('FROZEN', '冷凍食品', 'A7', 'F12');
      const grocery = createTestCell('GROCERY', '日用品', 'A13', 'F20');

      // 衣料品エリア
      const menswear = createTestCell('MENS', '紳士服', 'G1', 'L8');
      const womenswear = createTestCell('WOMENS', '婦人服', 'G9', 'L16');
      const kidswear = createTestCell('KIDS', '子供服', 'G17', 'L20');

      // レジエリア
      const checkout = createTestCell('CHECKOUT', 'レジ', 'M1', 'L20');

      // 客用通路
      const aisle1 = createTestCell('', '通路1', 'F7', 'F12');
      const aisle2 = createTestCell('', '通路2', 'G9', 'G16');
      const mainAisle = createTestCell('', 'メイン通路', 'M1', 'L20');

      placeCell(grid, fresh, 0, 0, 5, 5);
      placeCell(grid, frozen, 6, 0, 11, 5);
      placeCell(grid, grocery, 12, 0, 19, 5);
      placeCell(grid, menswear, 0, 6, 7, 11);
      placeCell(grid, womenswear, 8, 6, 15, 11);
      placeCell(grid, kidswear, 16, 6, 19, 11);
      placeCell(grid, checkout, 0, 12, 19, 11);
      placeCell(grid, aisle1, 6, 6, 11, 6);
      placeCell(grid, aisle2, 8, 6, 15, 6);
      placeCell(grid, mainAisle, 0, 12, 19, 12);

      // 商品エリア間の境界線
      const freshBorders = calculateAllBorders(fresh, { row: 0, col: 0 }, { row: 5, col: 5 }, grid);
      const frozenBorders = calculateAllBorders(frozen, { row: 6, col: 0 }, { row: 11, col: 5 }, grid);

      // 異なる商品エリア間は青い境界線
      expect(freshBorders.borderBottom).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(frozenBorders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);

      // 通路との境界も青い境界線
      expect(freshBorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('動的配置変更シナリオ', () => {
    it('倉庫拡張シミュレーション - 段階的拡張', () => {
      // 初期状態（小規模）
      let grid = createGrid(6, 8);
      const initialWarehouse = createTestCell('WH-01', '初期倉庫', 'A1', 'F8');
      placeCell(grid, initialWarehouse, 0, 0, 5, 7);

      const initialBorders = calculateAllBorders(initialWarehouse, { row: 0, col: 0 }, { row: 5, col: 7 }, grid);
      // 現在の実装では、エッジのセルは青い境界線を持つ
      expect(initialBorders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(initialBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);

      // 拡張後（大規模）
      grid = createGrid(10, 12);
      const expandedMain = createTestCell('WH-01', '拡張メイン', 'A1', 'H8');
      const newSection = createTestCell('WH-02', '新設エリア', 'I1', 'L8');
      const additionalStorage = createTestCell('WH-01', '追加倉庫', 'A9', 'H10');

      placeCell(grid, expandedMain, 0, 0, 7, 7);
      placeCell(grid, newSection, 0, 8, 7, 11);
      placeCell(grid, additionalStorage, 8, 0, 9, 7);

      // 拡張後の境界線確認
      const expandedBorders = calculateAllBorders(expandedMain, { row: 0, col: 0 }, { row: 7, col: 7 }, grid);
      const newSectionBorders = calculateAllBorders(newSection, { row: 0, col: 8 }, { row: 7, col: 11 }, grid);
      const additionalBorders = calculateAllBorders(additionalStorage, { row: 8, col: 0 }, { row: 9, col: 7 }, grid);

      // 同一保管場所（WH-01）でも現在の実装では境界線がある
      expect(expandedBorders.borderBottom).toBe(`1px solid ${COLORS.BORDER}`);
      expect(additionalBorders.borderTop).toBe(`1px solid ${COLORS.BORDER}`);

      // 異なる保管場所（WH-02）との境界は青い境界線
      expect(expandedBorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(newSectionBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('季節商品入れ替えシミュレーション', () => {
      const grid = createGrid(8, 12);
      
      // 夏季レイアウト
      const summerClothing = createTestCell('SUMMER', '夏物衣料', 'A1', 'F6');
      const summerSports = createTestCell('SPORTS-S', '夏季スポーツ', 'G1', 'L6');
      const aircon = createTestCell('AC', 'エアコン', 'A7', 'F8');
      const pool = createTestCell('POOL', 'プール用品', 'G7', 'L8');

      placeCell(grid, summerClothing, 0, 0, 5, 5);
      placeCell(grid, summerSports, 0, 6, 5, 11);
      placeCell(grid, aircon, 6, 0, 7, 5);
      placeCell(grid, pool, 6, 6, 7, 11);

      // 夏季レイアウトの境界線確認
      const summerBorders = calculateAllBorders(summerClothing, { row: 0, col: 0 }, { row: 5, col: 5 }, grid);
      const sportsBorders = calculateAllBorders(summerSports, { row: 0, col: 6 }, { row: 5, col: 11 }, grid);

      expect(summerBorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(sportsBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);

      // 冬季レイアウトへの変更をシミュレーション
      const winterGrid = createGrid(8, 12);
      const winterClothing = createTestCell('WINTER', '冬物衣料', 'A1', 'F8');
      const winterSports = createTestCell('SPORTS-W', '冬季スポーツ', 'G1', 'L6');
      const heater = createTestCell('HEAT', '暖房器具', 'G7', 'L8');

      placeCell(winterGrid, winterClothing, 0, 0, 7, 5);
      placeCell(winterGrid, winterSports, 0, 6, 5, 11);
      placeCell(winterGrid, heater, 6, 6, 7, 11);

      const winterClothingBorders = calculateAllBorders(winterClothing, { row: 0, col: 0 }, { row: 7, col: 5 }, winterGrid);
      const winterSportsBorders = calculateAllBorders(winterSports, { row: 0, col: 6 }, { row: 5, col: 11 }, winterGrid);

      expect(winterClothingBorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(winterSportsBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('例外的配置パターン', () => {
    it('迷路型配置 - 複雑な通路システム', () => {
      const grid = createGrid(10, 10);
      
      // 迷路のような通路配置
      const pathCell = createTestCell('', '通路', 'A1', 'J10');
      const storage1 = createTestCell('ST-1', '保管1', 'B2', 'C3');
      const storage2 = createTestCell('ST-2', '保管2', 'E2', 'F3');
      const storage3 = createTestCell('ST-3', '保管3', 'H2', 'I3');
      const storage4 = createTestCell('ST-4', '保管4', 'B5', 'C6');
      const storage5 = createTestCell('ST-5', '保管5', 'E5', 'F6');
      const storage6 = createTestCell('ST-6', '保管6', 'H5', 'I6');
      const storage7 = createTestCell('ST-7', '保管7', 'B8', 'C9');
      const storage8 = createTestCell('ST-8', '保管8', 'E8', 'F9');
      const storage9 = createTestCell('ST-9', '保管9', 'H8', 'I9');

      // 通路を基本として配置
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          grid[row][col] = pathCell;
        }
      }

      // 保管エリアを上書き配置
      placeCell(grid, storage1, 1, 1, 2, 2);
      placeCell(grid, storage2, 1, 4, 2, 5);
      placeCell(grid, storage3, 1, 7, 2, 8);
      placeCell(grid, storage4, 4, 1, 5, 2);
      placeCell(grid, storage5, 4, 4, 5, 5);
      placeCell(grid, storage6, 4, 7, 5, 8);
      placeCell(grid, storage7, 7, 1, 8, 2);
      placeCell(grid, storage8, 7, 4, 8, 5);
      placeCell(grid, storage9, 7, 7, 8, 8);

      // 各保管エリアの境界線確認
      const storage1Borders = calculateAllBorders(storage1, { row: 1, col: 1 }, { row: 2, col: 2 }, grid);
      const storage5Borders = calculateAllBorders(storage5, { row: 4, col: 4 }, { row: 5, col: 5 }, grid);

      // 保管エリアと通路の境界は青い境界線
      expect(storage1Borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(storage1Borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(storage5Borders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(storage5Borders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);

      // 通路セル間の境界線確認
      const pathBorders = calculateAllBorders(pathCell, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);
      expect(pathBorders.borderRight).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });

    it('フラクタル配置 - 入れ子構造', () => {
      const grid = createGrid(9, 9);
      
      // 大エリア
      const bigArea = createTestCell('BIG', '大エリア', 'A1', 'I9');
      placeCell(grid, bigArea, 0, 0, 8, 8);

      // 中エリア（大エリア内）
      const mediumArea = createTestCell('MED', '中エリア', 'C3', 'G7');
      placeCell(grid, mediumArea, 2, 2, 6, 6);

      // 小エリア（中エリア内）
      const smallArea = createTestCell('SMALL', '小エリア', 'E5', 'E5');
      placeCell(grid, smallArea, 4, 4, 4, 4);

      // 各レベルの境界線確認
      const bigBorders = calculateAllBorders(bigArea, { row: 0, col: 0 }, { row: 8, col: 8 }, grid);
      const mediumBorders = calculateAllBorders(mediumArea, { row: 2, col: 2 }, { row: 6, col: 6 }, grid);
      const smallBorders = calculateAllBorders(smallArea, { row: 4, col: 4 }, { row: 4, col: 4 }, grid);

      // 異なる保管場所間は青い境界線
      expect(mediumBorders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(mediumBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(smallBorders.borderTop).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
      expect(smallBorders.borderLeft).toBe(`3px solid ${COLORS.GROUP_BORDER}`);
    });
  });

  describe('大規模データ処理テスト', () => {
    it('100x100グリッドでのパフォーマンステスト', () => {
      const grid = createGrid(100, 100);
      const cells: PlaceMapList[] = [];

      // 大量のセルを生成
      for (let i = 0; i < 50; i++) {
        const cell = createTestCell(`WH-${String(i).padStart(3, '0')}`, `倉庫${i}`, 'A1', 'B2');
        cells.push(cell);
        
        const startRow = Math.floor(i / 10) * 10;
        const startCol = (i % 10) * 10;
        placeCell(grid, cell, startRow, startCol, startRow + 9, startCol + 9);
      }

      const startTime = performance.now();

      // 各セルの境界線を計算
      const results = cells.map((cell, index) => {
        const startRow = Math.floor(index / 10) * 10;
        const startCol = (index % 10) * 10;
        return calculateAllBorders(cell, 
          { row: startRow, col: startCol }, 
          { row: startRow + 9, col: startCol + 9 }, 
          grid
        );
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // パフォーマンス要件: 1秒以下で完了
      expect(duration).toBeLessThan(1000);
      expect(results.length).toBe(50);

      // 結果の妥当性確認
      results.forEach(border => {
        expect(border.borderTop).toBeDefined();
        expect(border.borderRight).toBeDefined();
        expect(border.borderBottom).toBeDefined();
        expect(border.borderLeft).toBeDefined();
      });
    });

    it('複雑な配置での空セル計算パフォーマンス', () => {
      const grid = createGrid(50, 50);
      
      // チェッカーボード状の複雑な配置
      for (let row = 0; row < 50; row++) {
        for (let col = 0; col < 50; col++) {
          if ((row + col) % 3 === 0) {
            const cell = createTestCell(`CHK-${row}-${col}`, `チェック${row}${col}`, 'A1', 'A1');
            placeCell(grid, cell, row, col, row, col);
          }
        }
      }

      const startTime = performance.now();

      // 全ての空セルの境界線を計算
      const emptyBorders: any[] = [];
      for (let row = 0; row < 50; row++) {
        for (let col = 0; col < 50; col++) {
          if (!grid[row][col]) {
            emptyBorders.push(calculateEmptyCellBorders(row, col, grid));
          }
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // パフォーマンス要件: 2秒以下で完了
      expect(duration).toBeLessThan(2000);
      expect(emptyBorders.length).toBeGreaterThan(0);

      // 結果の妥当性確認
      emptyBorders.forEach(border => {
        expect(border.borderTop).toBeDefined();
        expect(border.borderRight).toBeDefined();
        expect(border.borderBottom).toBeDefined();
        expect(border.borderLeft).toBeDefined();
      });
    });
  });

  describe('エラー耐性とエッジケース', () => {
    it('部分的に破損したグリッドデータ', () => {
      const grid = createGrid(5, 5);
      
      // 正常なセル
      const normalCell = createTestCell('NORMAL', '正常', 'A1', 'A1');
      placeCell(grid, normalCell, 0, 0, 0, 0);

      // 破損したセル（nullプロパティ）
      const corruptedCell = { ...createTestCell('CORRUPT', '破損', 'B1', 'B1') };
      corruptedCell.storageLocationCd = null as any;
      placeCell(grid, corruptedCell, 0, 1, 0, 1);

      // undefinedセル
      const undefinedCell = { ...createTestCell('UNDEF', '未定義', 'C1', 'C1') };
      undefinedCell.storageLocationCd = undefined as any;
      placeCell(grid, undefinedCell, 0, 2, 0, 2);

      // 境界線計算がエラーにならないことを確認
      expect(() => {
        calculateAllBorders(normalCell, { row: 0, col: 0 }, { row: 0, col: 0 }, grid);
      }).not.toThrow();

      expect(() => {
        calculateAllBorders(corruptedCell, { row: 0, col: 1 }, { row: 0, col: 1 }, grid);
      }).not.toThrow();

      expect(() => {
        calculateAllBorders(undefinedCell, { row: 0, col: 2 }, { row: 0, col: 2 }, grid);
      }).not.toThrow();
    });

    it('グリッド境界を超えたセル範囲指定', () => {
      const grid = createGrid(3, 3);
      const cell = createTestCell('OVER', 'オーバー', 'A1', 'A1');
      placeCell(grid, cell, 1, 1, 1, 1);

      // 正常範囲
      expect(() => {
        calculateAllBorders(cell, { row: 1, col: 1 }, { row: 1, col: 1 }, grid);
      }).not.toThrow();

      // 境界を超えた範囲（エラーにならないことを確認）
      expect(() => {
        calculateAllBorders(cell, { row: -1, col: -1 }, { row: 5, col: 5 }, grid);
      }).not.toThrow();

      expect(() => {
        calculateEmptyCellBorders(-1, -1, grid);
      }).not.toThrow();

      expect(() => {
        calculateEmptyCellBorders(10, 10, grid);
      }).not.toThrow();
    });

    it('空のグリッドでの処理', () => {
      const emptyGrid: (PlaceMapList | null)[][] = [];

      expect(() => {
        calculateEmptyCellBorders(0, 0, emptyGrid);
      }).not.toThrow();

      // 1x1の空グリッド
      const singleEmptyGrid = [[null]];
      const borders = calculateEmptyCellBorders(0, 0, singleEmptyGrid);
      
      expect(borders.borderTop).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      expect(borders.borderRight).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      expect(borders.borderBottom).toBe(`1px solid ${COLORS.GRID_BORDER}`);
      expect(borders.borderLeft).toBe(`1px solid ${COLORS.GRID_BORDER}`);
    });
  });
});