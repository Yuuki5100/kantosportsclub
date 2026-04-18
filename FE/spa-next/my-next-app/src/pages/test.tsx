import React from 'react';
import ListView, {
  ColumnDefinition,
  RowDefinition,
  SearchDefinition,
} from '@/components/composite/Listview/ListView';
import FileUploader from '@/components/composite/FileUpload/FileUploader';
import { UploadedFile } from '@/hooks/useFileUploader';
import { Box, Font14, Font24, TextBox } from '@/components/base';
import ButtonAction from '@/components/base/Button/ButtonAction';

const TestPage: React.FC = () => {
  const handleFileUploadChange = (files: UploadedFile[]) => {
    console.log("アップロードされたファイル:", files);
  };

  const columns: ColumnDefinition[] = [
    { id: 'id', label: 'ID', display: true, sortable: true, align: 'left' },
    { id: 'name', label: '名前', display: true, sortable: true, align: 'center' },
    { id: 'description', label: '説明', display: true, sortable: false, align: 'center' },
  ];

  const searchOptions: SearchDefinition = {
    title: '検索条件',
    accordionSx: { width: '100%', backgroundColor: '#f9f9f9', mt: 2 },
    elements: (
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Font14 bold={false}>名前</Font14>
          <TextBox name="name" customStyle={{ width: '200px' }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Font14 bold={false}>メール</Font14>
          <TextBox name="email" customStyle={{ width: '240px' }} />
        </Box>
        <ButtonAction label="検索" />
      </Box>
    ),
  };

  const rowData: RowDefinition[] = Array.from({ length: 100 }, (_, index) => ({
    cells: [
      { id: `id-${index}`, columnId: 'id', cell: index + 1, value: index + 1 },
      { id: `name-${index}`, columnId: 'name', cell: `ユーザー${index + 1}`, value: `ユーザー${index + 1}` },
      { id: `desc-${index}`, columnId: 'description', cell: `これはユーザー${index + 1}の説明です。`, value: `説明${index + 1}` },
    ],
  }));

  return (
    <Box sx={{ padding: 4 }}>
      <Font24 sx={{ mb: 2 }}>
        検索画面（テスト）
      </Font24>

      {/* 📎 ファイルアップローダーコンポーネント */}
      <FileUploader onChange={handleFileUploadChange} />

      <ListView
        columns={columns}
        rowData={rowData}
        searchOptions={searchOptions}
        sx={{ maxHeight: '400px' }}
      />
    </Box>
  );
};

export default TestPage;
