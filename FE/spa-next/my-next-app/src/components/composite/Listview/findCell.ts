import { CellDefinition } from '@/components/composite/Listview/ListView';

/**
 * セルを取得する
 *
 * @param {CellDefinition[]}
 * @param {string | number} columnId
 * @return {ReactNode | undefined}
 */
export const findCell = (row: CellDefinition[], columnId: string | number): CellDefinition | undefined =>
  row.find((x) => x.columnId == columnId);
