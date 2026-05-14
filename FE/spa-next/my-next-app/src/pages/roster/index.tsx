import React from 'react';
import ListView, {
  ColumnDefinition,
  RowDefinition,
  SearchDefinition,
} from '@/components/composite/Listview/ListView';
import { Box, Font14, Font20 } from '@/components/base';
import PageContainer from '@base/Layout/PageContainer';
import colors from '@/styles/colors';

type UniformType = 'G' | 'F' | 'C';

type UniformItem = {
  name: string;
  uniformName: string;
  number: number;
  size: string;
  types: UniformType[];
};

const uniformData: UniformItem[] = [
  { name: 'ゲスト用①', uniformName: 'GUEST', number: 0, size: 'L', types: [] },
  { name: 'ゲスト用②', uniformName: 'GUEST', number: 1, size: 'L', types: [] },
  { name: '成田', uniformName: 'YU', number: 8, size: 'XO', types: ['C'] },
  { name: '小泉', uniformName: 'KOIZUMI', number: 11, size: 'L', types: ['G'] },
  { name: '織田', uniformName: 'O.D.', number: 13, size: 'L', types: ['G'] },
  { name: '和田', uniformName: 'WS', number: 22, size: 'L', types: ['F', 'G'] },
  { name: '後藤', uniformName: 'Y.GOTO', number: 33, size: 'L', types: ['F', 'C'] },
  { name: '大澤', uniformName: 'OSAWA', number: 34, size: 'O', types: ['C'] },
  { name: '圭太', uniformName: 'KEITA', number: 44, size: 'L', types: ['C'] },
  { name: '太一', uniformName: 'TAICHI', number: 62, size: 'L', types: ['F', 'G'] },
  { name: '高村', uniformName: 'T.K.', number: 66, size: 'L', types: ['C'] },
  { name: '孝文', uniformName: 'TAKAFUMI', number: 77, size: 'L', types: ['F'] },
  { name: '阿部', uniformName: 'ABE', number: 84, size: 'L', types: ['G'] },
  { name: '河原', uniformName: 'KAWAHARA', number: 99, size: 'O', types: ['F'] },
];

const columns: ColumnDefinition[] = [
  { id: 'name', label: '名前', display: true, sortable: true, align: 'center', widthPercent: 24 },
  { id: 'uniformName', label: 'name', display: true, sortable: true, align: 'center', widthPercent: 28 },
  { id: 'number', label: '番号', display: true, sortable: true, align: 'center', widthPercent: 14 },
  { id: 'size', label: 'サイズ', display: true, sortable: true, align: 'center', widthPercent: 14 },
  { id: 'type', label: 'タイプ', display: true, sortable: true, align: 'center', widthPercent: 20 },
];

const getTypeColor = (type: UniformType): string => {
  if (type === 'G') {
    return '#d9ead3';
  }
  if (type === 'F') {
    return '#fce4d6';
  }
  return '#d9edf7';
};

const TypeBadges = ({ types }: { types: UniformType[] }) => {
  if (types.length === 0) {
    return <Box component="span">-</Box>;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
      {types.map((type) => (
        <Box
          component="span"
          key={type}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 28,
            px: 1,
            py: 0.25,
            borderRadius: '4px',
            fontWeight: 'bold',
            backgroundColor: getTypeColor(type),
            color: colors.commonFontColorBlack,
          }}
        >
          {type}
        </Box>
      ))}
    </Box>
  );
};

const createCell = (
  columnId: string,
  rowId: string,
  cell: React.ReactNode,
  value: string | number
) => ({
  id: `${columnId}-${rowId}`,
  columnId,
  cell,
  value,
});

const rowData: RowDefinition[] = uniformData.map((item) => {
  const rowId = `${item.number}-${item.uniformName}`;

  return {
    cells: [
      createCell('name', rowId, item.name, item.name),
      createCell('uniformName', rowId, item.uniformName, item.uniformName),
      createCell('number', rowId, item.number, item.number),
      createCell('size', rowId, item.size, item.size),
      createCell('type', rowId, <TypeBadges types={item.types} />, item.types.join(',')),
    ],
  };
});

const searchOptions: SearchDefinition = {
  title: 'タイプ解説',
  accordionSx: { width: '100%' },
  elements: (
    <Box sx={{ p: 2, color: colors.grayDark, lineHeight: 1.8 }}>
      <Font14 sx={{ color: colors.grayDark }}>
        G（ガード）：攻撃の起点。戦術を組み立てる役割
      </Font14>
      <Font14 sx={{ color: colors.grayDark }}>
        F（フォワード）：点取り屋。積極的に得点に絡む役割
      </Font14>
      <Font14 sx={{ color: colors.grayDark }}>
        C（センター）：攻守の要。攻守ともにゴール下を占領する役割
      </Font14>
    </Box>
  ),
};

const Roster: React.FC = () => {
  return (
    <PageContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Font20>ユニフォーム情報 / タイプ</Font20>
        </Box>

        <ListView
          columns={columns}
          rowData={rowData}
          searchOptions={searchOptions}
          topPaginationHidden={true}
          bottomPaginationHidden={true}
          sx={{
            width: '100%',
            tableLayout: 'fixed',
            '& table': {
              tableLayout: 'fixed',
              width: '100%',
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              backgroundColor: colors.commonTableHeader,
              color: colors.commonFontColorBlack,
              fontWeight: 600,
            },
            '& .MuiTableBody-root .MuiTableCell-root': {
              backgroundColor: colors.commonFontColorWhite,
              color: colors.commonFontColorBlack,
              borderBottom: `1.5px solid ${colors.commonBorderGray}`,
            },
            '& .MuiTableRow-root:hover .MuiTableCell-root': {
              backgroundColor: colors.commonTableHover,
            },
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        />
      </Box>
    </PageContainer>
  );
};

export default Roster;
