import React from 'react';
import { Box, DropBox } from '@/components/base';
import type { SelectChangeEvent } from '@/components/base';
import IconButtonBase from '@/components/base/Button/IconButtonBase';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import PaginationNumberButtons from './PaginationNumberButtons';
import { SortParams } from './SortParams';
import { Font14 } from '@/components/base';

/**
 * ページネーションのプロパティ定義
 */
type PaginationProps = {
  /** データの総件数 */
  count: number;

  /** 現在のページ番号（1ベース） */
  page: number;

  /** 1ページあたりの表示件数（デフォルト：50） */
  rowsPerPage?: number;

  /**
   * ページ変更時のコールバック関数
   * @param page - 新しいページ番号（1ベース）
   * @param searchParams - 現在の検索／ソート条件
   */
  onPageChange: (page: number, searchParams: SortParams) => void;

  /**
   * 表示件数変更時のコールバック関数
   * @param event - SelectChangeEvent<number>
   */
  onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;

  /** 現在のソート・検索パラメータ */
  searchParams: SortParams;

  /**
   * 表示件数の選択肢（デフォルト：[10, 20, 50, 100]）
   */
  rowsPerPageOptions?: number[];

  hidden?: boolean;
};

/**
 * ListViewPagination コンポーネント
 *
 * 表示構成：
 * [ 件数表示 ] [ページ移動矢印 + 番号ボタン] [表示件数選択]
 *
 * - MUIのTablePaginationを使わず、すべてカスタム実装
 * - レスポンシブ対応
 * - 柔軟な並び順・表示順制御
 */
const ListViewPagination: React.FC<PaginationProps> = ({
  count,
  page,
  rowsPerPage = 50,
  onPageChange,
  onRowsPerPageChange,
  searchParams,
  rowsPerPageOptions = [10, 20, 50, 100],
  hidden = false,
}) => {
  if (hidden) {
    return null; // 非表示の場合は何もレンダリングしない
  }

  const totalPages = Math.ceil(count / rowsPerPage);
  const rowsPerPageOptionItems = rowsPerPageOptions.map((option) => ({
    value: option.toString(),
    label: option.toString(),
  }));

  const handleRowsPerPageChange = (event: SelectChangeEvent<string>) => {
    const value = Number(event.target.value);
    const castEvent = {
      ...event,
      target: { ...event.target, value },
    } as SelectChangeEvent<number>;
    onRowsPerPageChange(castEvent);
  };

  /** 最初のページかどうか判定 */
  const isFirstPage = page === 1;

  /** 最後のページかどうか判定 */
  const isLastPage = page >= totalPages;

  /** 表示範囲の開始・終了番号を計算 */
  const from = count === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const to = Math.min(page * rowsPerPage, count);

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      mt={2}
      width="100%"
    >
      {/* ===================== 件数表示エリア（左） ===================== */}
      <Font14 bold={false} sx={{ minWidth: '160px' }}>
        {count > 0
          ? `${from} - ${to} 件 / 全 ${count} 件`
          : 'データなし'}
      </Font14>

      {/* ===================== ページネーションボタン（中央） ===================== */}
      <Box display="flex" flexDirection="row" alignItems="center" flexWrap="wrap">
        {/* 最初のページへ移動 */}
        <IconButtonBase
          onClick={() => onPageChange(1, searchParams)}
          disabled={isFirstPage}
          aria-label="最初のページ"
        >
          <FirstPageIcon />
        </IconButtonBase>

        {/* 前のページへ移動 */}
        <IconButtonBase
          onClick={() => onPageChange(page - 1, searchParams)}
          disabled={isFirstPage}
          aria-label="前のページ"
        >
          <KeyboardArrowLeft />
        </IconButtonBase>

        {/* 中央：ページ番号ボタン */}
        <PaginationNumberButtons
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => onPageChange(p, searchParams)}
          range={3}
        />

        {/* 次のページへ移動 */}
        <IconButtonBase
          onClick={() => onPageChange(page + 1, searchParams)}
          disabled={isLastPage}
          aria-label="次のページ"
        >
          <KeyboardArrowRight />
        </IconButtonBase>

        {/* 最後のページへ移動 */}
        <IconButtonBase
          onClick={() => onPageChange(totalPages, searchParams)}
          disabled={isLastPage}
          aria-label="最後のページ"
        >
          <LastPageIcon />
        </IconButtonBase>
      </Box>

      {/* ===================== 表示件数セレクト（右） ===================== */}
      <Box display="flex" flexDirection="row" alignItems="center">
        <Font14 bold={false} sx={{ mr: 1 }}>
          表示件数:
        </Font14>
        <DropBox
          name="rows-per-page"
          selectedValue={rowsPerPage.toString()}
          options={rowsPerPageOptionItems}
          onChange={handleRowsPerPageChange}
          customStyle={{ minWidth: '80px' }}
        />
      </Box>
    </Box>
  );
};

export default ListViewPagination;
