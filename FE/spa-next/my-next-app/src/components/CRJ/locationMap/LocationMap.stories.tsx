import type { Meta, StoryObj } from '@storybook/react';
import LocationMap from './LocationMap';
import { useState, useRef } from 'react';
import { Box, Button, TextField, Checkbox, FormControlLabel, Typography, Grid, Paper, Slider, MenuItem, Alert, Snackbar } from '@mui/material';
import { UploadFile, Download, Clear } from '@mui/icons-material';
import { SelectedPlaceMap, PlaceMapList } from './types';

const meta: Meta<typeof LocationMap> = {
  title: 'CRJ/LocationMap/LocationMap',
  component: LocationMap,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LocationMap>;

// CSV処理のヘルパー関数
const parseCSV = (csvText: string): PlaceMapList[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const header = lines[0].split(',').map(h => h.trim());
  
  // 日本語ヘッダーと英語フィールドのマッピング
  const headerMapping: Record<string, string> = {
    '保管場所コード': 'storageLocationCd',
    '保管場所名': 'storageLocationName',
    '配置コード': 'placementCd',
    '配置名': 'placementName',
    '容量': 'capacityQuantity',
    '一時停止フラグ': 'suspendedFlag',
    '開始セル': 'mapAllocationStartCell',
    '終了セル': 'mapAllocationEndCell',
    'ロケーションコード': 'locationCd'
  };
  
  const expectedJapaneseHeaders = Object.keys(headerMapping);
  const expectedEnglishHeaders = Object.values(headerMapping);
  
  // 日本語ヘッダーまたは英語ヘッダーの検証
  const hasAllJapaneseHeaders = expectedJapaneseHeaders.every(expected => 
    header.some(h => h === expected)
  );
  
  const hasAllEnglishHeaders = expectedEnglishHeaders.every(expected => 
    header.some(h => h === expected)
  );
  
  if (!hasAllJapaneseHeaders && !hasAllEnglishHeaders) {
    throw new Error(`CSVのヘッダーが不正です。必要なヘッダー（日本語）: ${expectedJapaneseHeaders.join(', ')}`);
  }
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));  // クォートを除去
    const row: any = {};
    
    header.forEach((h, i) => {
      let fieldName = h;
      
      // 日本語ヘッダーの場合は英語フィールド名に変換
      if (headerMapping[h]) {
        fieldName = headerMapping[h];
      }
      
      if (expectedEnglishHeaders.includes(fieldName)) {
        if (fieldName === 'suspendedFlag') {
          const val = values[i].toLowerCase();
          row[fieldName] = val === 'true' || val === '1' || val === 'はい' || val === 'yes';
        } else {
          row[fieldName] = values[i] || '';
        }
      }
    });
    
    // 必須フィールドの検証（開始セルと終了セルのみ必須）
    if (!row.mapAllocationStartCell || !row.mapAllocationEndCell) {
      throw new Error(`行 ${index + 2}: 開始セル、終了セルは必須です`);
    }
    
    return row as PlaceMapList;
  });
};

const exportToCSV = (data: PlaceMapList[]): string => {
  // 日本語ヘッダーを使用
  const japaneseHeaders = [
    '保管場所コード', '保管場所名', '配置コード', '配置名',
    '容量', '一時停止フラグ', '開始セル', '終了セル', 'ロケーションコード'
  ];
  
  const englishFields = [
    'storageLocationCd', 'storageLocationName', 'placementCd', 'placementName',
    'capacityQuantity', 'suspendedFlag', 'mapAllocationStartCell', 'mapAllocationEndCell', 'locationCd'
  ];
  
  const csvLines = [
    japaneseHeaders.join(','),
    ...data.map(item =>
      englishFields.map(field => {
        const value = item[field as keyof PlaceMapList];
        if (field === 'suspendedFlag') {
          return value ? 'true' : 'false';
        }
        return `"${value || ''}"`;
      }).join(',')
    )
  ];
  
  return csvLines.join('\n');
};

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// サンプルデータ
const sampleData = [
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
  {
    storageLocationCd: 'SL001',
    storageLocationName: '保管場所1',
    placementCd: 'P002',
    placementName: '配置2',
    capacityQuantity: '200',
    suspendedFlag: false,
    mapAllocationStartCell: 'C1',
    mapAllocationEndCell: 'D3',
    locationCd: 'L001',
  },
  {
    storageLocationCd: 'SL002',
    storageLocationName: '保管場所2',
    placementCd: 'P003',
    placementName: '配置3',
    capacityQuantity: '150',
    suspendedFlag: true,
    mapAllocationStartCell: 'E1',
    mapAllocationEndCell: 'F2',
    locationCd: 'L002',
  },
  {
    storageLocationCd: 'SL003',
    storageLocationName: '保管場所3',
    placementCd: 'P004',
    placementName: '配置4',
    capacityQuantity: '300',
    suspendedFlag: false,
    mapAllocationStartCell: 'A4',
    mapAllocationEndCell: 'C6',
    locationCd: 'L003',
  },
];

// 基本的な表示
export const Default: Story = {
  args: {
    data: sampleData,
    selectedRowId: '',
    selectedPlaceMap: [],
    columnLength: 21,
    rowLength: 15,
  },
};

// 選択された状態
export const WithSelection: Story = {
  args: {
    data: sampleData,
    selectedRowId: 'P002',
    selectedPlaceMap: [
      { columnId: 'storageLocationCd', value: 'SL001' },
      { columnId: 'placementCd', value: 'P002' },
    ],
    columnLength: 21,
    rowLength: 15,
  },
};

// 大きなグリッドサイズ
export const LargeGrid: Story = {
  args: {
    data: [
      ...sampleData,
      {
        storageLocationCd: 'SL004',
        storageLocationName: '保管場所4',
        placementCd: 'P005',
        placementName: '配置5',
        capacityQuantity: '500',
        suspendedFlag: false,
        mapAllocationStartCell: 'G1',
        mapAllocationEndCell: 'K5',
        locationCd: 'L004',
      },
      {
        storageLocationCd: 'SL005',
        storageLocationName: '保管場所5',
        placementCd: 'P006',
        placementName: '配置6',
        capacityQuantity: '250',
        suspendedFlag: false,
        mapAllocationStartCell: 'L1',
        mapAllocationEndCell: 'O3',
        locationCd: 'L005',
      },
    ],
    selectedRowId: '',
    selectedPlaceMap: [],
    columnLength: 21,
    rowLength: 25,
  },
};

// 空のデータ
export const EmptyData: Story = {
  args: {
    data: [],
    selectedRowId: '',
    selectedPlaceMap: [],
    columnLength: 21,
    rowLength: 15,
  },
};

// 一時停止フラグがある配置を選択
export const SuspendedSelection: Story = {
  args: {
    data: sampleData,
    selectedRowId: 'P003',
    selectedPlaceMap: [
      { columnId: 'storageLocationCd', value: 'SL002' },
      { columnId: 'placementCd', value: 'P003' },
    ],
    columnLength: 21,
    rowLength: 15,
  },
};

// 隣接する領域のマージテスト
export const AdjacentAreas: Story = {
  args: {
    data: [
      {
        storageLocationCd: 'SL001',
        storageLocationName: '保管場所1',
        placementCd: 'P001',
        placementName: '配置1-1',
        capacityQuantity: '100',
        suspendedFlag: false,
        mapAllocationStartCell: 'A1',
        mapAllocationEndCell: 'B2',
        locationCd: 'L001',
      },
      {
        storageLocationCd: 'SL001',
        storageLocationName: '保管場所1',
        placementCd: 'P002',
        placementName: '配置1-2',
        capacityQuantity: '100',
        suspendedFlag: false,
        mapAllocationStartCell: 'C1',
        mapAllocationEndCell: 'D2',
        locationCd: 'L001',
      },
      {
        storageLocationCd: 'SL001',
        storageLocationName: '保管場所1',
        placementCd: 'P003',
        placementName: '配置1-3',
        capacityQuantity: '100',
        suspendedFlag: false,
        mapAllocationStartCell: 'A3',
        mapAllocationEndCell: 'D3',
        locationCd: 'L001',
      },
    ],
    selectedRowId: '',
    selectedPlaceMap: [],
    columnLength: 21,
    rowLength: 15,
  },
};

// 容量表示なしのパターン
export const WithoutCapacity: Story = {
  args: {
    data: [
      {
        storageLocationCd: 'SL001',
        storageLocationName: '保管場所1',
        placementCd: 'P001',
        placementName: '配置A',
        capacityQuantity: '',
        suspendedFlag: false,
        mapAllocationStartCell: 'A1',
        mapAllocationEndCell: 'B2',
        locationCd: 'L001',
      },
      {
        storageLocationCd: 'SL002',
        storageLocationName: '保管場所2',
        placementCd: 'P002',
        placementName: '配置B',
        capacityQuantity: '',
        suspendedFlag: false,
        mapAllocationStartCell: 'C1',
        mapAllocationEndCell: 'D2',
        locationCd: 'L002',
      },
    ],
    selectedRowId: '',
    selectedPlaceMap: [],
    columnLength: 21,
    rowLength: 15,
  },
};

// インタラクティブなプレイグラウンド
const InteractiveLocationMap = () => {
  const [data, setData] = useState(sampleData);
  const [selectedPlacement, setSelectedPlacement] = useState<string>('');
  const [columnLength, setColumnLength] = useState(21);
  const [rowLength, setRowLength] = useState(15);
  const [newPlacement, setNewPlacement] = useState({
    storageLocationCd: '',
    storageLocationName: '（空）',
    placementCd: '',
    placementName: '',
    capacityQuantity: '',
    suspendedFlag: false,
    mapAllocationStartCell: '',
    mapAllocationEndCell: '',
    locationCd: '',
  });

  // CSV関連のstate
  const [csvError, setCsvError] = useState<string>('');
  const [csvSuccess, setCsvSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ストレージロケーション選択肢
  const storageLocationOptions = [
    { code: '', name: '（空）', locationCd: '' },
    { code: 'SL001', name: '保管場所1', locationCd: 'L001' },
    { code: 'SL002', name: '保管場所2', locationCd: 'L002' },
    { code: 'SL003', name: '保管場所3', locationCd: 'L003' },
    { code: 'SL004', name: '保管場所4', locationCd: 'L004' },
  ];

  const handleAddPlacement = () => {
    if (newPlacement.mapAllocationStartCell && newPlacement.mapAllocationEndCell) {
      setData([...data, { ...newPlacement }]);
      setNewPlacement({
        ...newPlacement,
        placementCd: '',
        placementName: '',
        capacityQuantity: '',
        mapAllocationStartCell: '',
        mapAllocationEndCell: '',
      });
    }
  };

  const handleDeletePlacement = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    // 削除されたアイテムが選択されていた場合は選択を解除
    const deletedItem = data[index];
    if (deletedItem && selectedPlacement === deletedItem.placementCd) {
      setSelectedPlacement('');
    }
  };

  const handleSelectPlacement = (placementCd: string) => {
    setSelectedPlacement(placementCd === selectedPlacement ? '' : placementCd);
  };

  // CSV取り込み処理
  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvError('');
    setCsvSuccess('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const importedData = parseCSV(csvText);
        setData(importedData);
        setCsvSuccess(`${importedData.length}件のデータを取り込みました`);
        setSelectedPlacement('');
      } catch (error) {
        setCsvError(error instanceof Error ? error.message : 'CSVの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
    
    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // CSV エクスポート処理
  const handleCSVExport = () => {
    try {
      const csvContent = exportToCSV(data);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      downloadCSV(csvContent, `location_map_${timestamp}.csv`);
      setCsvSuccess('CSVファイルをダウンロードしました');
    } catch (error) {
      setCsvError('CSVのエクスポートに失敗しました');
    }
  };

  // データクリア処理
  const handleClearData = () => {
    setData([]);
    setSelectedPlacement('');
    setCsvSuccess('全データをクリアしました');
  };

  // サンプルCSVのダウンロード
  const handleDownloadSampleCSV = () => {
    const sampleCSV = exportToCSV(sampleData);
    downloadCSV(sampleCSV, 'location_map_sample.csv');
    setCsvSuccess('サンプルCSVをダウンロードしました');
  };

  const selectedPlaceMap: SelectedPlaceMap[] = selectedPlacement ? [
    {
      columnId: 'storageLocationCd',
      value: data.find(d => d.placementCd === selectedPlacement)?.storageLocationCd || ''
    },
    {
      columnId: 'placementCd',
      value: selectedPlacement
    },
  ] : [];

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100vh', p: 2 }}>
      <Paper sx={{ p: 2, width: 400, overflow: 'auto', flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>配置管理</Typography>

        {/* CSV操作セクション */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>CSV操作</Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<UploadFile />}
                onClick={() => fileInputRef.current?.click()}
                size="small"
                fullWidth
              >
                CSV取り込み
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleCSVExport}
                size="small"
                fullWidth
                disabled={data.length === 0}
              >
                CSV出力
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                onClick={handleDownloadSampleCSV}
                size="small"
                fullWidth
              >
                サンプルCSV
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClearData}
                size="small"
                fullWidth
                disabled={data.length === 0}
              >
                全削除
              </Button>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            CSV形式: 保管場所コード,保管場所名,配置コード,配置名,容量,一時停止フラグ,開始セル,終了セル,ロケーションコード
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>グリッドサイズ</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="列数"
                type="number"
                value={columnLength}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value > 0) setColumnLength(value);
                }}
                inputProps={{ min: 1 }}
                fullWidth
                helperText={columnLength > 26 ? "AA列以降も対応" : ""}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="行数"
                type="number"
                value={rowLength}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value > 0) setRowLength(value);
                }}
                inputProps={{ min: 1 }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>新しい配置を追加</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                select
                size="small"
                label="保管場所"
                value={newPlacement.storageLocationCd}
                onChange={(e) => {
                  const selected = storageLocationOptions.find(opt => opt.code === e.target.value);
                  if (selected) {
                    setNewPlacement({
                      ...newPlacement,
                      storageLocationCd: selected.code,
                      storageLocationName: selected.name,
                      locationCd: selected.locationCd
                    });
                  }
                }}
                fullWidth
                helperText="同じ保管場所の配置は自動的にグルーピングされます"
                SelectProps={{
                  native: false,
                }}
              >
                {storageLocationOptions.map((option) => (
                  <MenuItem key={option.code} value={option.code}>
                    {option.name} ({option.code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="配置コード"
                value={newPlacement.placementCd}
                onChange={(e) => setNewPlacement({ ...newPlacement, placementCd: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="配置名"
                value={newPlacement.placementName}
                onChange={(e) => setNewPlacement({ ...newPlacement, placementName: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="開始セル (例: A1)"
                value={newPlacement.mapAllocationStartCell}
                onChange={(e) => setNewPlacement({ ...newPlacement, mapAllocationStartCell: e.target.value.toUpperCase() })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="終了セル (例: B2)"
                value={newPlacement.mapAllocationEndCell}
                onChange={(e) => setNewPlacement({ ...newPlacement, mapAllocationEndCell: e.target.value.toUpperCase() })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                label="容量"
                value={newPlacement.capacityQuantity}
                onChange={(e) => setNewPlacement({ ...newPlacement, capacityQuantity: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newPlacement.suspendedFlag}
                    onChange={(e) => setNewPlacement({ ...newPlacement, suspendedFlag: e.target.checked })}
                  />
                }
                label="一時停止"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleAddPlacement} fullWidth>
                追加
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="subtitle2" gutterBottom>既存の配置 (クリックで選択)</Typography>
        {data.map((item, index) => (
          <Paper
            key={index}
            sx={{
              p: 1,
              mb: 1,
              cursor: 'pointer',
              backgroundColor: selectedPlacement === item.placementCd ? 'primary.light' : 'background.paper',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
            onClick={() => handleSelectPlacement(item.placementCd)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2">
                  {item.placementName} ({item.placementCd})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.storageLocationName} ({item.storageLocationCd}) | {item.mapAllocationStartCell} - {item.mapAllocationEndCell}
                  {item.capacityQuantity && ` | 容量: ${item.capacityQuantity}`}
                  {item.suspendedFlag && ' | 一時停止'}
                </Typography>
              </Box>
              <Button
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePlacement(index);
                }}
              >
                削除
              </Button>
            </Box>
          </Paper>
        ))}
      </Paper>

      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <LocationMap
          data={data}
          selectedRowId={selectedPlacement}
          selectedPlaceMap={selectedPlaceMap}
          columnLength={columnLength}
          rowLength={rowLength}
          containerSx={{ 
            marginLeft: '30px', // Playgroundでは従来のマージンを維持
            height: '100%', 
            maxHeight: 'none' 
          }}
          disableAutoHeight
        />
      </Box>

      {/* エラー・成功メッセージ */}
      <Snackbar 
        open={!!csvError} 
        autoHideDuration={6000} 
        onClose={() => setCsvError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setCsvError('')}>
          {csvError}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!csvSuccess} 
        autoHideDuration={3000} 
        onClose={() => setCsvSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setCsvSuccess('')}>
          {csvSuccess}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// 柔軟なレイアウトのデモンストレーション
export const FlexibleLayout: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      {/* コンパクトな表示 */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>コンパクト表示（カスタム高さ）</Typography>
        <LocationMap
          data={sampleData.slice(0, 2)}
          selectedRowId=""
          selectedPlaceMap={[]}
          columnLength={10}
          rowLength={8}
          containerSx={{ 
            maxHeight: '300px',
            border: '1px solid #ddd',
            borderRadius: 1
          }}
        />
      </Paper>

      {/* フルサイズ表示 */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>フルサイズ表示（自動高さ無効）</Typography>
        <LocationMap
          data={sampleData}
          selectedRowId=""
          selectedPlaceMap={[]}
          columnLength={15}
          rowLength={20}
          containerSx={{ 
            height: '500px',
            border: '2px solid #1976d2',
            borderRadius: 2,
            backgroundColor: '#f5f5f5',
            padding: 1
          }}
          disableAutoHeight
        />
      </Paper>

      {/* インライン表示 */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>左側パネル</Typography>
          <LocationMap
            data={[sampleData[0]]}
            selectedRowId=""
            selectedPlaceMap={[]}
            columnLength={5}
            rowLength={5}
            containerSx={{ 
              maxHeight: '200px',
              marginLeft: 0, // マージンを削除
              border: '1px solid #green'
            }}
            tableSx={{
              width: '100%',
              fontSize: '12px'
            }}
          />
        </Paper>
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>右側パネル</Typography>
          <LocationMap
            data={[sampleData[1]]}
            selectedRowId=""
            selectedPlaceMap={[]}
            columnLength={5}
            rowLength={5}
            containerSx={{ 
              maxHeight: '200px',
              marginLeft: 0, // マージンを削除
              border: '1px solid #orange'
            }}
          />
        </Paper>
      </Box>
    </Box>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: `
このストーリーはLocationMapの柔軟なレイアウト対応を示します。

### 新機能:
1. **containerSx**: コンテナの任意のMUIスタイルを指定可能
2. **tableSx**: テーブルの任意のCSSスタイルを指定可能  
3. **disableAutoHeight**: 自動高さ計算を無効化して完全にカスタム制御可能

### 使用例:
- コンパクト表示: 高さ制限と枠線
- フルサイズ表示: 自動高さ無効化と背景色設定
- インライン表示: マージン削除して並列配置

呼び出す側が完全に制御できるため、任意のレイアウトに組み込み可能です。
        `,
      },
    },
  },
};

export const Playground: Story = {
  render: () => <InteractiveLocationMap />,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: `
このインタラクティブストーリーでは、UIを通じてLocationMapコンポーネントを操作できます。

### 機能:
1. **CSV操作**: 
   - CSV取り込み: CSVファイルから配置データを一括インポート
   - CSV出力: 現在の配置データをCSVファイルとしてエクスポート
   - サンプルCSV: CSVフォーマットのサンプルファイルをダウンロード
   - 全削除: 全配置データをクリア
2. **グリッドサイズ調整**: 数値入力で列数・行数を自由に設定（上限なし、Excel形式列名対応）
3. **配置の追加**: 左パネルのフォームから新しい配置を追加
4. **ストレージロケーション選択**: 保管場所を選択してグルーピングをテスト
5. **自動グルーピング**: 同じ保管場所の隣接する配置が自動的にグルーピング境界線で囲まれる
6. **配置の選択**: 既存の配置をクリックして選択（ハイライト表示）
7. **配置の削除**: 各配置の削除ボタンで削除
8. **リアルタイム更新**: 追加・削除・選択がマップに即座に反映

### 使い方:
#### CSV操作:
- **CSV取り込み**: 「CSV取り込み」ボタンでCSVファイルを選択し、配置データを一括インポート
- **CSV出力**: 「CSV出力」ボタンで現在のデータをCSVファイルとしてダウンロード
- **サンプルCSV**: 「サンプルCSV」ボタンでCSVフォーマットのサンプルをダウンロード
- **全削除**: 「全削除」ボタンで全データをクリア

#### 手動操作:
- グリッドサイズを数値入力で自由に設定（列はA-Z, AA-AZ, BA-BZ...と拡張、行数も無制限）
- 保管場所を選択（SL001〜SL004の4つから選択可能）
- 配置コード、配置名、開始セル（例: A1, AA1）、終了セル（例: B2, AB5）を入力して「追加」ボタンをクリック
- 容量や一時停止フラグも設定可能
- 同じ保管場所の隣接する配置は青色の境界線でグルーピングされる
- 既存の配置をクリックすると、マップ上でハイライト表示
- 不要な配置は削除ボタンで削除

### CSVフォーマット:
必須ヘッダー（日本語）: \`保管場所コード,保管場所名,配置コード,配置名,容量,一時停止フラグ,開始セル,終了セル,ロケーションコード\`

サンプル行:
\`\`\`
SL001,保管場所1,P001,配置1,100,false,A1,B2,L001
\`\`\`

※ 一時停止フラグは「true」「false」で入力してください（「はい」「いいえ」「1」「0」も対応）

### テスト例:
#### CSV操作テスト:
1. 「サンプルCSV」ボタンでサンプルファイルをダウンロード
2. ダウンロードしたCSVファイルを編集（Excel等で開いて内容を変更）
3. 「CSV取り込み」ボタンで編集したCSVを取り込み
4. 「CSV出力」ボタンで現在のデータをエクスポート

#### グルーピングテスト:
1. 保管場所「SL001」でA1-B2の配置を追加
2. 同じ「SL001」でC1-D2の配置を追加（隣接する場合は境界線が統合される）
3. 異なる保管場所「SL002」でE1-F2の配置を追加（別の境界線が表示される）
        `,
      },
    },
  },
};