// EmptyCellコンポーネントのテスト

import React from 'react';
import { render } from '@testing-library/react';
import { EmptyCell } from './EmptyCell';
import { PlaceMapList } from '../types';
import { COLORS } from '../constants';

describe('EmptyCell Component', () => {
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

  describe('基本的なレンダリング', () => {
    it('空セルが正しくレンダリングされる', () => {
      const gridData: (PlaceMapList | null)[][] = [[null]];
      
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <EmptyCell rowIndex={0} colIndex={0} gridData={gridData} />
            </tr>
          </tbody>
        </table>
      );

      const cell = container.querySelector('td');
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveStyle({ 
        backgroundColor: COLORS.EMPTY,
        width: '45px',
        height: '45px',
      });
    });

    it('正しいサイズでレンダリングされる', () => {
      const gridData: (PlaceMapList | null)[][] = [[null]];
      
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <EmptyCell rowIndex={0} colIndex={0} gridData={gridData} />
            </tr>
          </tbody>
        </table>
      );

      const cell = container.querySelector('td');
      expect(cell).toHaveStyle({
        width: '45px',
        height: '45px',
      });
    });
  });

  describe('境界線スタイル', () => {
    it('グルーピングありセルに隣接する場合、青い境界線が表示される', () => {
      const groupCell = createTestCell('SL001');
      const gridData: (PlaceMapList | null)[][] = [
        [groupCell, null],
        [null, null],
      ];
      
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <EmptyCell rowIndex={0} colIndex={1} gridData={gridData} />
            </tr>
          </tbody>
        </table>
      );

      const cell = container.querySelector('td');
      expect(cell).toHaveStyle({
        borderLeft: `3px solid ${COLORS.GROUP_BORDER}`,
        borderTop: `1px solid ${COLORS.GRID_BORDER}`, // グリッド外
        borderRight: `1px solid ${COLORS.GRID_BORDER}`, // グリッド外
        borderBottom: `1px solid ${COLORS.GRID_BORDER}`, // 空セル
      });
    });

    it('通路セル（グルーピングなし）に隣接する場合、青い境界線が表示される', () => {
      const passageCell = createTestCell('', '通路');
      const gridData: (PlaceMapList | null)[][] = [
        [passageCell, null],
        [null, null],
      ];
      
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <EmptyCell rowIndex={0} colIndex={1} gridData={gridData} />
            </tr>
          </tbody>
        </table>
      );

      const cell = container.querySelector('td');
      expect(cell).toHaveStyle({
        borderLeft: `3px solid ${COLORS.GROUP_BORDER}`, // 通路セル（セルが存在）
        borderTop: `1px solid ${COLORS.GRID_BORDER}`,
        borderRight: `1px solid ${COLORS.GRID_BORDER}`,
        borderBottom: `1px solid ${COLORS.GRID_BORDER}`,
      });
    });

    it('全方向が空セルの場合、黒い境界線が表示される', () => {
      const gridData: (PlaceMapList | null)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ];
      
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <EmptyCell rowIndex={1} colIndex={1} gridData={gridData} />
            </tr>
          </tbody>
        </table>
      );

      const cell = container.querySelector('td');
      expect(cell).toHaveStyle({
        borderTop: `1px solid ${COLORS.GRID_BORDER}`,
        borderRight: `1px solid ${COLORS.GRID_BORDER}`,
        borderBottom: `1px solid ${COLORS.GRID_BORDER}`,
        borderLeft: `1px solid ${COLORS.GRID_BORDER}`,
      });
    });
  });

  describe('CSVテストケースのシミュレーション', () => {
    it('K6の右側の空セル（通路セルに隣接）', () => {
      const passageCell = createTestCell('', '通路', 'K1', 'K10');
      const gridData: (PlaceMapList | null)[][] = Array(10)
        .fill(null)
        .map(() => Array(12).fill(null));
      
      // K列（列10）に通路セルを配置
      for (let row = 0; row < 10; row++) {
        gridData[row][10] = passageCell;
      }
      
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <EmptyCell rowIndex={5} colIndex={11} gridData={gridData} />
            </tr>
          </tbody>
        </table>
      );

      const cell = container.querySelector('td');
      // 左側は通路セルに隣接しているため青い境界線（セルが存在）
      expect(cell).toHaveStyle({
        borderLeft: `3px solid ${COLORS.GROUP_BORDER}`,
      });
    });
  });

  describe('マルチセルスパン対応', () => {
    it('複数セルにまたがるセルに隣接する場合も正しく判定される', () => {
      const multiCell = createTestCell('SL001', '大きなセル', 'A1', 'B2');
      const gridData: (PlaceMapList | null)[][] = [
        [multiCell, multiCell, null],
        [multiCell, multiCell, null],
        [null, null, null],
      ];
      
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <EmptyCell rowIndex={0} colIndex={2} gridData={gridData} />
            </tr>
          </tbody>
        </table>
      );

      const cell = container.querySelector('td');
      // 左側はマルチセルに隣接
      expect(cell).toHaveStyle({
        borderLeft: `3px solid ${COLORS.GROUP_BORDER}`,
      });
    });
  });

  describe('Edge Cases', () => {
    it('0x0グリッドでもエラーにならない', () => {
      const gridData: (PlaceMapList | null)[][] = [];
      
      expect(() => {
        render(
          <table>
            <tbody>
              <tr>
                <EmptyCell rowIndex={0} colIndex={0} gridData={gridData} />
              </tr>
            </tbody>
          </table>
        );
      }).not.toThrow();
    });

    it('グリッドの角の空セル', () => {
      const groupCell = createTestCell('SL001');
      const gridData: (PlaceMapList | null)[][] = [
        [null, groupCell],
        [groupCell, groupCell],
      ];
      
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <EmptyCell rowIndex={0} colIndex={0} gridData={gridData} />
            </tr>
          </tbody>
        </table>
      );

      const cell = container.querySelector('td');
      expect(cell).toHaveStyle({
        borderTop: `1px solid ${COLORS.GRID_BORDER}`, // グリッド外
        borderLeft: `1px solid ${COLORS.GRID_BORDER}`, // グリッド外
        borderRight: `3px solid ${COLORS.GROUP_BORDER}`, // グルーピングあり
        borderBottom: `3px solid ${COLORS.GROUP_BORDER}`, // グルーピングあり
      });
    });
  });
});