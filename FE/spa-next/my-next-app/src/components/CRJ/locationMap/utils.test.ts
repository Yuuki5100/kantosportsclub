import {
  generateColumns,
  parseCellPosition,
  getBackgroundColor,
  areAreasAdjacent,
  mergeAdjacentAreas,
  generateStorageLocationAreas,
} from './utils';
import { PlaceMapList, StorageLocationArea } from './types';
import { COLORS } from './constants';

describe('generateColumns', () => {
  it('指定された数の列ラベルを生成する', () => {
    expect(generateColumns(5)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('0個の列でも空配列を返す', () => {
    expect(generateColumns(0)).toEqual([]);
  });

  it('26個の列でA-Zを生成する', () => {
    const columns = generateColumns(26);
    expect(columns[0]).toBe('A');
    expect(columns[25]).toBe('Z');
    expect(columns.length).toBe(26);
  });

  it('27列目はAAになる', () => {
    const columns = generateColumns(27);
    expect(columns[0]).toBe('A');
    expect(columns[26]).toBe('AA');
    expect(columns.length).toBe(27);
  });
});

describe('parseCellPosition', () => {
  it('正しいセル位置を解析する', () => {
    expect(parseCellPosition('A1')).toEqual({ row: 0, col: 0 });
    expect(parseCellPosition('B2')).toEqual({ row: 1, col: 1 });
    expect(parseCellPosition('Z10')).toEqual({ row: 9, col: 25 });
  });

  it('空文字列の場合は-1を返す', () => {
    expect(parseCellPosition('')).toEqual({ row: -1, col: -1 });
  });

  it('無効な形式の場合は-1を返す', () => {
    expect(parseCellPosition('ABC')).toEqual({ row: -1, col: -1 });
    expect(parseCellPosition('1A')).toEqual({ row: -1, col: -1 });
    expect(parseCellPosition('A')).toEqual({ row: -1, col: -1 });
  });

  it('複数桁の行番号も正しく解析する', () => {
    expect(parseCellPosition('A100')).toEqual({ row: 99, col: 0 });
    expect(parseCellPosition('C999')).toEqual({ row: 998, col: 2 });
  });
});

describe('getBackgroundColor', () => {
  const normalCell: PlaceMapList = {
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

  const suspendedCell: PlaceMapList = {
    ...normalCell,
    suspendedFlag: true,
  };

  it('nullセルの場合は透明色を返す', () => {
    expect(getBackgroundColor(null)).toBe(COLORS.TRANSPARENT);
  });

  it('通常のセルの場合は通常色を返す', () => {
    expect(getBackgroundColor(normalCell)).toBe(COLORS.NORMAL);
  });

  it('一時停止フラグがあるセルの場合は一時停止色を返す', () => {
    expect(getBackgroundColor(suspendedCell)).toBe(COLORS.SUSPENDED);
  });
});

describe('areAreasAdjacent', () => {
  it('横方向に隣接するエリアを正しく検出する', () => {
    const area1: StorageLocationArea = {
      minRow: 0,
      maxRow: 2,
      minCol: 0,
      maxCol: 1,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    };
    const area2: StorageLocationArea = {
      minRow: 0,
      maxRow: 2,
      minCol: 2,
      maxCol: 3,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    };
    
    expect(areAreasAdjacent(area1, area2)).toBe(true);
  });

  it('縦方向に隣接するエリアを正しく検出する', () => {
    const area1: StorageLocationArea = {
      minRow: 0,
      maxRow: 1,
      minCol: 0,
      maxCol: 2,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    };
    const area2: StorageLocationArea = {
      minRow: 2,
      maxRow: 3,
      minCol: 0,
      maxCol: 2,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    };
    
    expect(areAreasAdjacent(area1, area2)).toBe(true);
  });

  it('隣接していないエリアを正しく検出する', () => {
    const area1: StorageLocationArea = {
      minRow: 0,
      maxRow: 1,
      minCol: 0,
      maxCol: 1,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    };
    const area2: StorageLocationArea = {
      minRow: 3,
      maxRow: 4,
      minCol: 3,
      maxCol: 4,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    };
    
    expect(areAreasAdjacent(area1, area2)).toBe(false);
  });

  it('部分的に重なるエリアは隣接として扱わない', () => {
    const area1: StorageLocationArea = {
      minRow: 0,
      maxRow: 2,
      minCol: 0,
      maxCol: 2,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    };
    const area2: StorageLocationArea = {
      minRow: 1,
      maxRow: 3,
      minCol: 1,
      maxCol: 3,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    };
    
    expect(areAreasAdjacent(area1, area2)).toBe(false);
  });
});

describe('mergeAdjacentAreas', () => {
  it('隣接するエリアをマージする', () => {
    const areas: StorageLocationArea[] = [
      {
        minRow: 0,
        maxRow: 1,
        minCol: 0,
        maxCol: 1,
        storageLocationCd: 'SL001',
        locationCd: 'L001',
      },
      {
        minRow: 0,
        maxRow: 1,
        minCol: 2,
        maxCol: 3,
        storageLocationCd: 'SL001',
        locationCd: 'L001',
      },
    ];
    
    const merged = mergeAdjacentAreas(areas);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual({
      minRow: 0,
      maxRow: 1,
      minCol: 0,
      maxCol: 3,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    });
  });

  it('異なるストレージロケーションのエリアはマージしない', () => {
    const areas: StorageLocationArea[] = [
      {
        minRow: 0,
        maxRow: 1,
        minCol: 0,
        maxCol: 1,
        storageLocationCd: 'SL001',
        locationCd: 'L001',
      },
      {
        minRow: 0,
        maxRow: 1,
        minCol: 2,
        maxCol: 3,
        storageLocationCd: 'SL002',
        locationCd: 'L002',
      },
    ];
    
    const merged = mergeAdjacentAreas(areas);
    expect(merged).toHaveLength(2);
  });

  it('複数のエリアを連鎖的にマージする', () => {
    const areas: StorageLocationArea[] = [
      {
        minRow: 0,
        maxRow: 0,
        minCol: 0,
        maxCol: 0,
        storageLocationCd: 'SL001',
        locationCd: 'L001',
      },
      {
        minRow: 0,
        maxRow: 0,
        minCol: 1,
        maxCol: 1,
        storageLocationCd: 'SL001',
        locationCd: 'L001',
      },
      {
        minRow: 0,
        maxRow: 0,
        minCol: 2,
        maxCol: 2,
        storageLocationCd: 'SL001',
        locationCd: 'L001',
      },
    ];
    
    const merged = mergeAdjacentAreas(areas);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual({
      minRow: 0,
      maxRow: 0,
      minCol: 0,
      maxCol: 2,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    });
  });

  it('空の配列を処理できる', () => {
    expect(mergeAdjacentAreas([])).toEqual([]);
  });
});

describe('generateStorageLocationAreas', () => {
  it('PlaceMapListからStorageLocationAreaを生成する', () => {
    const items: PlaceMapList[] = [
      {
        storageLocationCd: 'SL001',
        storageLocationName: '保管場所1',
        placementCd: 'P001',
        placementName: '配置1',
        capacityQuantity: '100',
        suspendedFlag: false,
        mapAllocationStartCell: 'A1',
        mapAllocationEndCell: 'B2',
        locationCd: 'L001',
      },
    ];
    
    const areas = generateStorageLocationAreas(items);
    expect(areas).toHaveLength(1);
    expect(areas[0]).toEqual({
      minRow: 0,
      maxRow: 1,
      minCol: 0,
      maxCol: 1,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    });
  });

  it('セル位置が不正なアイテムはスキップする', () => {
    const items: PlaceMapList[] = [
      {
        storageLocationCd: 'SL001',
        storageLocationName: '保管場所1',
        placementCd: 'P001',
        placementName: '配置1',
        capacityQuantity: '100',
        suspendedFlag: false,
        mapAllocationStartCell: '',
        mapAllocationEndCell: 'B2',
        locationCd: 'L001',
      },
      {
        storageLocationCd: 'SL002',
        storageLocationName: '保管場所2',
        placementCd: 'P002',
        placementName: '配置2',
        capacityQuantity: '200',
        suspendedFlag: false,
        mapAllocationStartCell: 'C3',
        mapAllocationEndCell: 'D4',
        locationCd: 'L002',
      },
    ];
    
    const areas = generateStorageLocationAreas(items);
    expect(areas).toHaveLength(1);
    expect(areas[0].storageLocationCd).toBe('SL002');
  });

  it('隣接するアイテムをマージする', () => {
    const items: PlaceMapList[] = [
      {
        storageLocationCd: 'SL001',
        storageLocationName: '保管場所1',
        placementCd: 'P001',
        placementName: '配置1',
        capacityQuantity: '100',
        suspendedFlag: false,
        mapAllocationStartCell: 'A1',
        mapAllocationEndCell: 'A1',
        locationCd: 'L001',
      },
      {
        storageLocationCd: 'SL001',
        storageLocationName: '保管場所1',
        placementCd: 'P002',
        placementName: '配置2',
        capacityQuantity: '200',
        suspendedFlag: false,
        mapAllocationStartCell: 'B1',
        mapAllocationEndCell: 'B1',
        locationCd: 'L001',
      },
    ];
    
    const areas = generateStorageLocationAreas(items);
    expect(areas).toHaveLength(1);
    expect(areas[0]).toEqual({
      minRow: 0,
      maxRow: 0,
      minCol: 0,
      maxCol: 1,
      storageLocationCd: 'SL001',
      locationCd: 'L001',
    });
  });

  it('空の配列を処理できる', () => {
    expect(generateStorageLocationAreas([])).toEqual([]);
  });
});