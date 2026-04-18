import React from 'react';
import { Box, DropBox } from '@/components/base';
import type { SelectChangeEvent } from '@/components/base';
import IconButtonBase from '@/components/base/Button/IconButtonBase';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import PaginationNumberButtons from './PaginationNumberButtons';
import SortParams from '@/components/composite/Listview/SortParams';
import { Font14 } from '@/components/base';


type CustomPaginationBarProps = {
  /** 総件数（例：250） */
  count: number;

  /** 現在のページ（1ベース） */
  page: number;

  /** 1ページあたりの件数（例：50） */
  rowsPerPage: number;

  /** 検索・ソートパラメータ */
  searchParams: SortParams;

  /** ページ番号の変更イベント（1ベース） */
  onPageChange: (page: number, searchParams: SortParams) => void;

  /** 表示件数変更イベント */
  onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;
};

const CustomPaginationBar: React.FC<CustomPaginationBarProps> = ({
  count,
  page,
  rowsPerPage,
  searchParams,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const totalPages = Math.ceil(count / rowsPerPage);
  const rowsPerPageOptionItems = [10, 20, 50, 100].map((option) => ({
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

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems="center"
      justifyContent="center"
      gap={2}
      mt={2}
    >
      {/* ◀ ナビゲーション（最初・前） */}
      <Box display="flex" flexDirection="row" alignItems="center">
        <IconButtonBase
          onClick={() => onPageChange(1, searchParams)}
          disabled={page === 1}
          aria-label="最初のページ"
        >
          <FirstPageIcon />
        </IconButtonBase>
        <IconButtonBase
          onClick={() => onPageChange(page - 1, searchParams)}
          disabled={page === 1}
          aria-label="前のページ"
        >
          <KeyboardArrowLeft />
        </IconButtonBase>
      </Box>

      {/* ● ページ番号ボタン（現在ページの前後3件） */}
      <PaginationNumberButtons
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => onPageChange(p, searchParams)}
        range={3}
      />

      {/* ▶ ナビゲーション（次・最後） */}
      <Box display="flex" flexDirection="row" alignItems="center">
        <IconButtonBase
          onClick={() => onPageChange(page + 1, searchParams)}
          disabled={page >= totalPages}
          aria-label="次のページ"
        >
          <KeyboardArrowRight />
        </IconButtonBase>
        <IconButtonBase
          onClick={() => onPageChange(totalPages, searchParams)}
          disabled={page >= totalPages}
          aria-label="最後のページ"
        >
          <LastPageIcon />
        </IconButtonBase>
      </Box>

      {/* ▼ 表示件数のセレクト */}
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

      {/* 件数表示 */}
      <Font14 bold={false}>
        {count > 0
          ? `${(page - 1) * rowsPerPage + 1} - ${Math.min(
              page * rowsPerPage,
              count
            )} 件 / 全 ${count} 件`
          : 'データなし'}
      </Font14>
    </Box>
  );
};

export default CustomPaginationBar;
