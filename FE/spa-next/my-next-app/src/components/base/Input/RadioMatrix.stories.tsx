import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Paper } from '@mui/material';
import RadioMatrix from './RadioMatrix';
import { OptionInfo } from '@/components/base/Input/OptionInfo';

const meta = {
  title: 'common-architecture/input/RadioMatrix',
  component: RadioMatrix,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

// サンプル選択肢
const sampleOptions: OptionInfo[] = [
  { value: 'none', label: 'なし' },
  { value: 'reference', label: '参照' },
  { value: 'update', label: '更新' },
  { value: 'approve', label: '承認' },
];

/**
 * 基本的な使用例
 */
export const Default: Story = {
  args: {
    options: sampleOptions,
    selectedValue: 'none',
  },
};

/**
 * 初期値なしの例
 */
export const WithoutInitialselectedValue: Story = {
  args: {
    options: sampleOptions,
  },
};

/**
 * コンポーネント全体が無効化された例
 */
export const Disabled: Story = {
  args: {
    options: sampleOptions,
    selectedValue: 'reference',
  },
};

/**
 * 特定のセルのみ無効化された例
 */
export const WithDisabledOptions: Story = {
  args: {
    options: [
      { value: 'none', label: 'なし' },
      { value: 'reference', label: '参照' },
      { value: 'update', label: '更新', disabled: true },
      { value: 'approve', label: '承認', disabled: true },
    ],
    selectedValue: 'reference',
  },
};

/**
 * イベントデモ（特定のセルが無効化された例）
 */
const EventDemoComponent = () => {
  const options: OptionInfo[] = [
    { value: 'none', label: 'なし' },
    { value: 'reference', label: '参照' },
    { value: 'update', label: '更新' },
    { value: 'approve', label: '承認', disabled: true },
  ];

  const [selectedValue, setSelectedValue] = useState<string>('none');
  const [changeCount, setChangeCount] = useState(0);
  const [lastChangeTime, setLastChangeTime] = useState<string>('-');
  const [lastSelectedValue, setLastSelectedValue] = useState<string>('-');

  const handleChange = (optionId: string) => {
    setSelectedValue(optionId);

    // イベント情報を更新
    setChangeCount(prev => prev + 1);
    setLastChangeTime(new Date().toLocaleTimeString());
    setLastSelectedValue(options.find(opt => opt.value === optionId)?.label ?? optionId);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        RadioMatrixイベントデモ (「承認」は無効)
      </Typography>

      <Box sx={{ mb: 3 }}>
        <RadioMatrix
          options={options}
          selectedValue={selectedValue}
          onChange={handleChange}
        />
      </Box>

      <Paper elevation={3} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle1" gutterBottom>
          イベントモニタリング:
        </Typography>

        <Box>
          <Typography variant="body2">
            <strong>onChange イベント:</strong>
          </Typography>
          <Typography variant="body2">
            発生回数: {changeCount}
          </Typography>
          <Typography variant="body2">
            最終発生時間: {lastChangeTime}
          </Typography>
          <Typography variant="body2">
            最後に選択した値: {lastSelectedValue}
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ※ onChangeイベントはラジオボタンを選択すると発生します。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ※ 無効化されたオプションは選択できません。
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          現在の選択値
        </Typography>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography>
            {options.find(opt => opt.value === selectedValue)?.label}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export const EventDemo: Story = {
  args: Default.args,
  render: EventDemoComponent
};

/**
 * 複数行の表示例
 * RadioMatrixを複数行にわたって表示し、縦の隙間がないことを確認する例
 */
const MultipleRowsComponent = () => {
  const permissionOptions: OptionInfo[] = [
    { value: 'none', label: 'なし' },
    { value: 'reference', label: '参照' },
    { value: 'update', label: '更新' },
    { value: 'approve', label: '承認' },
  ];

  // 各ページのデフォルト権限
  const [dashboardPermission, setDashboardPermission] = useState('reference');
  const [userManagementPermission, setUserManagementPermission] = useState('none');
  const [reportPermission, setReportPermission] = useState('update');
  const [settingsPermission, setSettingsPermission] = useState('approve');
  const [analyticsPermission, setAnalyticsPermission] = useState('reference');

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        複数行のRadioMatrix表示
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        各ページの権限設定を行います。
      </Typography>

      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" sx={{ width: '150px', fontWeight: 'bold' }}>
            ダッシュボード
          </Typography>
          <RadioMatrix
            options={permissionOptions}
            selectedValue={dashboardPermission}
            onChange={setDashboardPermission}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" sx={{ width: '150px', fontWeight: 'bold' }}>
            ユーザー管理
          </Typography>
          <RadioMatrix
            options={permissionOptions}
            selectedValue={userManagementPermission}
            onChange={setUserManagementPermission}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" sx={{ width: '150px', fontWeight: 'bold' }}>
            レポート
          </Typography>
          <RadioMatrix
            options={permissionOptions}
            selectedValue={reportPermission}
            onChange={setReportPermission}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" sx={{ width: '150px', fontWeight: 'bold' }}>
            設定
          </Typography>
          <RadioMatrix
            options={permissionOptions}
            selectedValue={settingsPermission}
            onChange={setSettingsPermission}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ width: '150px', fontWeight: 'bold' }}>
            分析
          </Typography>
          <RadioMatrix
            options={permissionOptions}
            selectedValue={analyticsPermission}
            onChange={setAnalyticsPermission}
          />
        </Box>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          現在の設定値
        </Typography>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="body2">
            ダッシュボード: {permissionOptions.find(opt => opt.value === dashboardPermission)?.label}
          </Typography>
          <Typography variant="body2">
            ユーザー管理: {permissionOptions.find(opt => opt.value === userManagementPermission)?.label}
          </Typography>
          <Typography variant="body2">
            レポート: {permissionOptions.find(opt => opt.value === reportPermission)?.label}
          </Typography>
          <Typography variant="body2">
            設定: {permissionOptions.find(opt => opt.value === settingsPermission)?.label}
          </Typography>
          <Typography variant="body2">
            分析: {permissionOptions.find(opt => opt.value === analyticsPermission)?.label}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export const MultipleRows: Story = {
  args: Default.args,
  render: MultipleRowsComponent
};
