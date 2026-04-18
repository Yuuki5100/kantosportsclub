import React, { useState, useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Paper } from '@mui/material';
import AutoCompleteMultiSelected from './AutoCompleteMultiSelected';

const meta = {
  title: 'common-architecture/input/AutoCompleteMultiSelected',
  component: AutoCompleteMultiSelected,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AutoCompleteMultiSelected>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的な使用例
 */
export const Default: Story = {
  args: {
    name: 'languages',
    options: [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'Python', value: 'py' },
      { label: 'Java', value: 'java' },
      { label: 'C#', value: 'csharp' },
    ],
  },
};

/**
 * 初期値を設定した例
 */
export const WithInitialValue: Story = {
  args: {
    name: 'languages',
    options: [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'Python', value: 'py' },
      { label: 'Java', value: 'java' },
      { label: 'C#', value: 'csharp' },
    ],
    defaultValue: ['js', 'ts'],
  },
};

/**
 * 無効化された例
 */
export const Disabled: Story = {
  args: {
    name: 'languages',
    options: [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'Python', value: 'py' },
      { label: 'Java', value: 'java' },
      { label: 'C#', value: 'csharp' },
    ],
    defaultValue: ['js', 'ts'],
    disabled: true,
  },
};

/**
 * エラー状態の例
 */
export const WithError: Story = {
  args: {
    name: 'languages',
    options: [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'Python', value: 'py' },
      { label: 'Java', value: 'java' },
      { label: 'C#', value: 'csharp' },
    ],
    error: true,
    helperText: '言語を1つ以上選択してください',
  },
};

/**
 * 多くの選択肢がある例
 */
export const ManyOptions: Story = {
  args: {
    name: 'languages',
    options: [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'Python', value: 'py' },
      { label: 'Java', value: 'java' },
      { label: 'C#', value: 'csharp' },
      { label: 'Ruby', value: 'ruby' },
      { label: 'PHP', value: 'php' },
      { label: 'Go', value: 'go' },
      { label: 'Swift', value: 'swift' },
      { label: 'Kotlin', value: 'kotlin' },
      { label: 'Rust', value: 'rust' },
      { label: 'Scala', value: 'scala' },
      { label: 'Perl', value: 'perl' },
      { label: 'Haskell', value: 'haskell' },
      { label: 'Clojure', value: 'clojure' },
    ],
  },
};

/**
 * カスタムスタイルの例
 */
export const WithCustomStyle: Story = {
  args: {
    name: 'languages',
    options: [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'Python', value: 'py' },
      { label: 'Java', value: 'java' },
      { label: 'C#', value: 'csharp' },
    ],
    customStyle: {
      width: '100%',
      mt: 0,
      mb: 2,
    },
  },
};

/**
 * フリーワード入力機能を有効にした例
 */
export const WithCustomValuesAllowed: Story = {
  args: {
    name: 'tags',
    options: [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'React', value: 'react' },
      { label: 'Vue', value: 'vue' },
      { label: 'Angular', value: 'angular' },
    ],
    allowCustomValues: true,
    placeholder: 'タグを入力または選択してください',
    helperText: 'リストにない技術スタックも自由に入力できます',
  },
};

/**
 * onChangeとonBlurイベントのデモ
 */
const EventDemoComponent = () => {
  const options = [
    { label: 'JavaScript', value: 'js' },
    { label: 'TypeScript', value: 'ts' },
    { label: 'Python', value: 'py' },
    { label: 'Java', value: 'java' },
    { label: 'C#', value: 'csharp' },
    { label: 'Ruby', value: 'ruby' },
    { label: 'PHP', value: 'php' },
  ];

  const [changeCount, setChangeCount] = useState(0);
  const [blurCount, setBlurCount] = useState(0);
  const [lastChangeTime, setLastChangeTime] = useState<string>('-');
  const [lastBlurTime, setLastBlurTime] = useState<string>('-');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [customValuesEnabled, setCustomValuesEnabled] = useState(false);

  const handleChange = (values: { label: string; value: string }[]) => {
    setChangeCount((prev) => prev + 1);
    setLastChangeTime(new Date().toLocaleTimeString());
    setSelectedValues(values.map(v => v.value));
  };

  const handleBlur = (_: React.FocusEvent<HTMLDivElement>) => {
    setBlurCount((prev) => prev + 1);
    setLastBlurTime(new Date().toLocaleTimeString());
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        AutoCompleteMultiSelectedイベントデモ
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <label>
            <input
              type="checkbox"
              checked={customValuesEnabled}
              onChange={(e) => setCustomValuesEnabled(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            フリーワード入力を有効化
          </label>
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <AutoCompleteMultiSelected
          name="languages"
          options={options}
          onChange={handleChange}
          onBlur={handleBlur}
          allowCustomValues={customValuesEnabled}
          placeholder={customValuesEnabled ? "言語を入力または選択してください" : undefined}
          helperText={customValuesEnabled ? "リストにない言語も自由に入力できます" : undefined}
        />
      </Box>

      <Paper elevation={3} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle1" gutterBottom>
          イベントモニタリング:
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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
              選択された値: {selectedValues.length > 0 ? selectedValues.join(', ') : 'なし'}
            </Typography>
            <Typography variant="body2">
              選択された言語: {
                selectedValues.length > 0
                  ? options
                      .filter(opt => selectedValues.includes(opt.value))
                      .map(opt => opt.label)
                      .join(', ')
                  : 'なし'
              }
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2">
              <strong>onBlur イベント:</strong>
            </Typography>
            <Typography variant="body2">
              発生回数: {blurCount}
            </Typography>
            <Typography variant="body2">
              最終発生時間: {lastBlurTime}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ※ onChangeイベントは選択肢を追加または削除するたびに発生します。
            onBlurイベントはコンポーネントからフォーカスが外れたときに発生します。
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export const EventDemo: Story = {
  args: Default.args,
  render: EventDemoComponent,
};

/**
 * 検索フィルターとしての利用例
 */
const SearchFilterDemo = () => {
  const categories = [
    { label: 'エレクトロニクス', value: 'electronics' },
    { label: '家具', value: 'furniture' },
    { label: '衣類', value: 'clothing' },
    { label: '書籍', value: 'books' },
    { label: '食品', value: 'food' },
  ];

  const items = [
    { id: 1, name: 'ノートパソコン', category: 'electronics', price: 80000 },
    { id: 2, name: 'デスクチェア', category: 'furniture', price: 15000 },
    { id: 3, name: 'Tシャツ', category: 'clothing', price: 2500 },
    { id: 4, name: 'プログラミング入門書', category: 'books', price: 3000 },
    { id: 5, name: '有機野菜セット', category: 'food', price: 4000 },
    { id: 6, name: 'スマートフォン', category: 'electronics', price: 70000 },
    { id: 7, name: 'ダイニングテーブル', category: 'furniture', price: 45000 },
    { id: 8, name: 'ジーンズ', category: 'clothing', price: 6000 },
    { id: 9, name: 'ビジネス書', category: 'books', price: 1500 },
    { id: 10, name: '調理済み食品', category: 'food', price: 800 },
  ];

  const [selectedCategories, setSelectedCategories] = useState<{ label: string; value: string }[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<{ label: string; value: string }[]>([]);
  const [keywordOptions, setKeywordOptions] = useState<{ label: string; value: string }[]>([]);
  const [filteredItems, setFilteredItems] = useState(items);

  // 検索キーワード変更ハンドラ
  const handleKeywordChange = (values: { label: string; value: string }[]) => {
    // 新しいカスタムキーワードを見つける
    const newCustomKeywords = values.filter(
      keyword => !keywordOptions.some(opt => opt.value === keyword.value)
    );

    // 新しいカスタムキーワードがあれば、それをキーワードオプションに追加
    if (newCustomKeywords.length > 0) {
      setKeywordOptions(prev => [...prev, ...newCustomKeywords]);
    }

    // 選択されたキーワードを更新
    setSearchKeywords(values);
  };

  useEffect(() => {
    // カテゴリーとキーワードでフィルタリング
    let filtered = items;

    // カテゴリーフィルター
    if (selectedCategories.length > 0) {
      const categoryValues = selectedCategories.map(c => c.value);
      filtered = filtered.filter(item => categoryValues.includes(item.category));
    }

    // キーワードフィルター（キーワードが商品名に含まれているか）
    if (searchKeywords.length > 0) {
      const keywords = searchKeywords.map(k => k.label.toLowerCase());
      filtered = filtered.filter(item =>
        keywords.some(keyword => item.name.toLowerCase().includes(keyword))
      );
    }

    setFilteredItems(filtered);
  }, [selectedCategories, searchKeywords, items]);

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        検索フィルター（フリーワード入力機能の実用例）
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        カテゴリーで絞り込みながら、自由にキーワードを入力して商品を検索できます。
        キーワード欄に入力して「Enter」キーを押すと、入力したキーワードで検索できます。
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          検索条件
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>カテゴリー:</Typography>
          <AutoCompleteMultiSelected
            name="categories"
            options={categories}
            onChange={setSelectedCategories}
            allowCustomValues={false}
            placeholder="カテゴリーを選択"
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>キーワード検索:</Typography>
          <AutoCompleteMultiSelected
            name="keywords"
            options={keywordOptions}
            onChange={handleKeywordChange}
            allowCustomValues={true}
            placeholder="キーワードを入力"
            helperText="複数のキーワードで検索できます"
          />
        </Box>
      </Paper>

      {/* 現在の検索条件を表示 */}
      {(selectedCategories.length > 0 || searchKeywords.length > 0) && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
          <Typography variant="subtitle2" gutterBottom>
            現在の検索条件:
          </Typography>

          {selectedCategories.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                カテゴリー:
              </Typography>
              {selectedCategories.map((category) => (
                <Box
                  key={category.value}
                  component="span"
                  sx={{
                    display: 'inline-block',
                    bgcolor: '#e8f5e9',
                    color: '#2e7d32',
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    mr: 0.5,
                    mb: 0.5
                  }}
                >
                  {category.label}
                </Box>
              ))}
            </Box>
          )}

          {searchKeywords.length > 0 && (
            <Box>
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                キーワード:
              </Typography>
              {searchKeywords.map((keyword) => (
                <Box
                  key={keyword.value}
                  component="span"
                  sx={{
                    display: 'inline-block',
                    bgcolor: '#e3f2fd',
                    color: '#1565c0',
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    mr: 0.5,
                    mb: 0.5
                  }}
                >
                  {keyword.label}
                  {!keywordOptions.some(k => k.value === keyword.value && k !== keyword) && ' (新規)'}
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      )}

      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          検索結果: {filteredItems.length}件
        </Typography>

        {filteredItems.length > 0 ? (
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <Box component="th" sx={{ textAlign: 'left', p: 1 }}>商品名</Box>
                <Box component="th" sx={{ textAlign: 'left', p: 1 }}>カテゴリー</Box>
                <Box component="th" sx={{ textAlign: 'right', p: 1 }}>価格</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {filteredItems.map((item) => (
                <Box
                  component="tr"
                  key={item.id}
                  sx={{
                    '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' },
                    '&:hover': { bgcolor: '#e3f2fd' }
                  }}
                >
                  <Box component="td" sx={{ p: 1 }}>{item.name}</Box>
                  <Box component="td" sx={{ p: 1 }}>
                    {categories.find(c => c.value === item.category)?.label}
                  </Box>
                  <Box component="td" sx={{ textAlign: 'right', p: 1 }}>
                    {item.price.toLocaleString()}円
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            条件に一致する商品はありません
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export const SearchFilter: Story = {
  args: Default.args,
  render: SearchFilterDemo,
};

/**
 * フリーワード入力機能のドキュメント
 */
export const CustomValuesDocumentation: Story = {
  args: Default.args,
  render: () => (
    <Box sx={{ maxWidth: 700, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        フリーワード入力機能の使い方
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: '#f9f9f9' }}>
        <Typography variant="subtitle1" gutterBottom>
          概要
        </Typography>
        <Typography variant="body2" paragraph>
          AutoCompleteMultiSelectedコンポーネントのフリーワード入力機能（allowCustomValues）を使用すると、
          あらかじめ定義されたオプションの中から選択するだけでなく、ユーザーが自由にカスタム値を入力することができます。
          この機能は、タグ付け、キーワード検索、フィルターなど、事前に全ての選択肢を定義できないケースに特に有用です。
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          主な特徴
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2">
            選択肢にない値も自由に入力可能
          </Typography>
          <Typography component="li" variant="body2">
            リアルタイムでカスタム値を作成・追加
          </Typography>
          <Typography component="li" variant="body2">
            既存のオプションと新規入力値を区別して管理
          </Typography>
          <Typography component="li" variant="body2">
            標準の選択操作と同じUIで一貫した使用感
          </Typography>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        実装方法
      </Typography>

      <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle2" gutterBottom color="primary">
          基本的な実装
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: '#f0f0f0',
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
          }}
        >
{`<AutoCompleteMultiSelected
  name="tags"
  options={[
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Angular', value: 'angular' },
  ]}
  onChange={handleChange}
  allowCustomValues={true}
  placeholder="タグを入力または選択してください"
/>`}
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 2, mb: 4, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle2" gutterBottom color="primary">
          カスタム値の処理例
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: '#f0f0f0',
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
          }}
        >
{`const [options, setOptions] = useState([
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
]);
const [selectedValues, setSelectedValues] = useState([]);

// カスタム値を含む選択変更のハンドリング
const handleChange = (newValues) => {
  // 新しいカスタム値があれば、保存しておく
  const customValues = newValues.filter(item =>
    !options.some(opt => opt.value === item.value)
  );

  if (customValues.length > 0) {
    // カスタム値をオプションリストに追加
    setOptions(prev => [...prev, ...customValues]);
  }

  setSelectedValues(newValues);
};`}
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        使用例
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            タグエディタ
          </Typography>
          <Typography variant="body2">
            記事やプロジェクトに対して、定義済みタグの選択と、新しいカスタムタグの作成を同時に行えます。
            ユーザー定義のタグを自由に追加でき、タグクラウドを柔軟に拡張できます。
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              使用例: 「TagEditor」ストーリーを参照
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            検索フィルター
          </Typography>
          <Typography variant="body2">
            検索キーワードを自由に入力でき、あらかじめ定義されていないキーワードでも検索条件として使用できます。
            複数のキーワードを組み合わせた高度な検索にも対応します。
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              使用例: 「SearchFilter」ストーリーを参照
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        関連するPropsリファレンス
      </Typography>

      <Box component="table" sx={{ width: '100%', mb: 4, borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr" sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Box component="th" sx={{ textAlign: 'left', p: 1.5 }}>プロパティ名</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1.5 }}>タイプ</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1.5 }}>デフォルト</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1.5 }}>説明</Box>
          </Box>
        </Box>
        <Box component="tbody">
          <Box component="tr" sx={{ borderBottom: '1px solid #f0f0f0' }}>
            <Box component="td" sx={{ p: 1.5 }}><code>allowCustomValues</code></Box>
            <Box component="td" sx={{ p: 1.5 }}><code>boolean</code></Box>
            <Box component="td" sx={{ p: 1.5 }}><code>false</code></Box>
            <Box component="td" sx={{ p: 1.5 }}>フリーワード入力を許可するかどうか</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #f0f0f0' }}>
            <Box component="td" sx={{ p: 1.5 }}><code>placeholder</code></Box>
            <Box component="td" sx={{ p: 1.5 }}><code>string</code></Box>
            <Box component="td" sx={{ p: 1.5 }}><code>undefined</code></Box>
            <Box component="td" sx={{ p: 1.5 }}>入力フィールドのプレースホルダーテキスト</Box>
          </Box>
          <Box component="tr" sx={{ borderBottom: '1px solid #f0f0f0' }}>
            <Box component="td" sx={{ p: 1.5 }}><code>onChange</code></Box>
            <Box component="td" sx={{ p: 1.5 }}><code>(values: Option[]) =&gt; void</code></Box>
            <Box component="td" sx={{ p: 1.5 }}><code>undefined</code></Box>
            <Box component="td" sx={{ p: 1.5 }}>選択値が変更されたときのコールバック関数</Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 1 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          ベストプラクティス
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
          <Typography component="li" variant="body2">
            フリーワード入力を許可する場合は、適切なプレースホルダーテキストを設定して機能の存在をユーザーに知らせる
          </Typography>
          <Typography component="li" variant="body2">
            ユーザー入力値のバリデーションを実装し、不適切な入力を防止する
          </Typography>
          <Typography component="li" variant="body2">
            フリーワード入力が適切なコンテキスト（タグ、検索キーワードなど）で使用する
          </Typography>
          <Typography component="li" variant="body2">
            ユーザーが入力したカスタム値は、適切に保存・管理し、次回の選択肢として再利用できるようにする
          </Typography>
        </Box>
      </Box>
    </Box>
  ),
};
