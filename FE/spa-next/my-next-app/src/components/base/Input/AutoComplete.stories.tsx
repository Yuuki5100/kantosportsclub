import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Paper } from '@mui/material';
import AutoComplete from './AutoComplete';
import TextBox from './TextBox';

const meta = {
  title: 'common-architecture/input/AutoComplete',
  component: AutoComplete,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AutoComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的な使用例
 */
export const Default: Story = {
  args: {
    name: 'country',
    options: [
      { label: '日本', value: 'japan' },
      { label: 'アメリカ', value: 'usa' },
      { label: 'イギリス', value: 'uk' },
      { label: 'フランス', value: 'france' },
      { label: 'ドイツ', value: 'germany' },
    ],
  },
};

/**
 * 初期値を設定した例
 */
export const WithInitialValue: Story = {
  args: {
    name: 'country',
    options: [
      { label: '日本', value: 'japan' },
      { label: 'アメリカ', value: 'usa' },
      { label: 'イギリス', value: 'uk' },
      { label: 'フランス', value: 'france' },
      { label: 'ドイツ', value: 'germany' },
    ],
    defaultValue: 'japan',
  },
};

/**
 * 無効化された例
 * - 背景色がグレーになる
 * - テキスト色がグレーになる
 * - 下向き矢印が表示される
 */
export const Disabled: Story = {
  args: {
    name: 'country',
    options: [
      { label: '日本', value: 'japan' },
      { label: 'アメリカ', value: 'usa' },
      { label: 'イギリス', value: 'uk' },
      { label: 'フランス', value: 'france' },
      { label: 'ドイツ', value: 'germany' },
    ],
    defaultValue: 'japan',
    disabled: true,
  },
};

/**
 * エラー状態の例
 */
export const WithError: Story = {
  args: {
    name: 'country',
    options: [
      { label: '日本', value: 'japan' },
      { label: 'アメリカ', value: 'usa' },
      { label: 'イギリス', value: 'uk' },
      { label: 'フランス', value: 'france' },
      { label: 'ドイツ', value: 'germany' },
    ],
    error: true,
    helperText: '国を選択してください',
  },
};

/**
 * 多くの選択肢がある例
 */
export const ManyOptions: Story = {
  args: {
    name: 'country',
    options: [
      { label: '日本', value: 'japan' },
      { label: 'アメリカ', value: 'usa' },
      { label: 'イギリス', value: 'uk' },
      { label: 'フランス', value: 'france' },
      { label: 'ドイツ', value: 'germany' },
      { label: 'イタリア', value: 'italy' },
      { label: 'スペイン', value: 'spain' },
      { label: 'カナダ', value: 'canada' },
      { label: 'オーストラリア', value: 'australia' },
      { label: 'ブラジル', value: 'brazil' },
      { label: 'インド', value: 'india' },
      { label: '中国', value: 'china' },
      { label: '韓国', value: 'korea' },
      { label: 'ロシア', value: 'russia' },
      { label: 'メキシコ', value: 'mexico' },
    ],
  },
};

/**
 * カスタムスタイルの例
 */
export const WithCustomStyle: Story = {
  args: {
    name: 'country',
    options: [
      { label: '日本', value: 'japan' },
      { label: 'アメリカ', value: 'usa' },
      { label: 'イギリス', value: 'uk' },
      { label: 'フランス', value: 'france' },
      { label: 'ドイツ', value: 'germany' },
    ],
    customStyle: {
      width: '100%',
      mt: 0,
      mb: 2,
    },
  },
};

type Option = {
  label: string;
  value: string;
};

const EventDemoComponent = () => {
  const options = [
    { label: '日本', value: 'japan' },
    { label: 'アメリカ', value: 'usa' },
    { label: 'イギリス', value: 'uk' },
    { label: 'フランス', value: 'france' },
    { label: 'ドイツ', value: 'germany' },
  ];

  const [changeCount, setChangeCount] = useState(0);
  const [blurCount, setBlurCount] = useState(0);
  const [lastChangeTime, setLastChangeTime] = useState<string>('-');
  const [lastBlurTime, setLastBlurTime] = useState<string>('-');
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleChange = (value: { label: string; value: string } | null) => {
    setChangeCount((prev) => prev + 1);
    setLastChangeTime(new Date().toLocaleTimeString());
    setSelectedValue(value?.value || null);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    setBlurCount((prev) => prev + 1);
    setLastBlurTime(new Date().toLocaleTimeString());
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        AutoCompleteイベントデモ
      </Typography>

      <Box sx={{ mb: 3 }}>
        <AutoComplete
          name="country"
          options={options}
          onChange={handleChange}
          onBlur={handleBlur}
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
            <Typography variant="body2">発生回数: {changeCount}</Typography>
            <Typography variant="body2">最終発生時間: {lastChangeTime}</Typography>
            <Typography variant="body2">現在の値: {selectedValue || 'なし'}</Typography>
            <Typography variant="body2">
              選択された国: {options.find((opt) => opt.value === selectedValue)?.label || 'なし'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2">
              <strong>onBlur イベント:</strong>
            </Typography>
            <Typography variant="body2">発生回数: {blurCount}</Typography>
            <Typography variant="body2">最終発生時間: {lastBlurTime}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ※ onChangeイベントはドロップダウンから値を選択すると発生します。
            onBlurイベントはコンポーネントからフォーカスが外れたときに発生します。
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
/**
 * onChangeイベントのデモ
 */
export const EventDemo: Story = {
  args: Default.args,
  render: EventDemoComponent,
};

/**
 * フリーワード入力の例
 * freeSolo=trueの場合、ドロップダウンアイコンが表示され、
 * 選択肢から選ぶことも自由入力もできます
 */
export const FreeSolo: Story = {
  args: {
    name: 'free-input',
    options: [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry' },
      { label: 'Orange', value: 'orange' },
      { label: 'Grape', value: 'grape' },
    ],
    freeSolo: true,
    helperText: '✨ ドロップダウンアイコンをクリックして選択肢を表示できます。フォーカス時にも自動でドロップダウンが開きます。',
  },
};

/**
 * フリーワード入力（初期値あり）の例
 */
export const FreeSoloWithInitialValue: Story = {
  args: {
    name: 'free-input-initial',
    options: [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
      { label: 'Cherry', value: 'cherry' },
      { label: 'Orange', value: 'orange' },
      { label: 'Grape', value: 'grape' },
    ],
    freeSolo: true,
    defaultValue: 'Mango', // 選択肢にない値を初期値として設定
    helperText: '初期値として選択肢にない値を設定',
  },
};


const FreeSoloDemoComponent = () => {
  const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Orange', value: 'orange' },
    { label: 'Grape', value: 'grape' },
  ];

  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [eventLog, setEventLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleChange = (value: { label: string; value: string } | null) => {
    setSelectedValue(value?.value || null);
    if (value) {
      addLog(`onChange: 選択肢から選択 - ${value.label} (${value.value})`);
    } else {
      addLog('onChange: 選択解除');
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    addLog(`onInputChange: "${value}"`);
  };

  const handleBlur = () => {
    addLog('onBlur: フォーカスが外れました');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        フリーワード入力デモ
      </Typography>

      <Box sx={{ mb: 3 }}>
        <AutoComplete
          name="fruit"
          options={options}
          freeSolo={true}
          onChange={handleChange}
          onInputChange={handleInputChange}
          onBlur={handleBlur}
          helperText="果物の名前を選択するか、自由に入力してください"
        />
      </Box>

      <Paper elevation={3} sx={{ p: 2, bgcolor: '#f5f5f5', mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          現在の状態:
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="body2">
              <strong>選択された値:</strong> {selectedValue || 'なし'}
            </Typography>
            <Typography variant="body2">
              <strong>入力値:</strong> {inputValue || 'なし'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2">
              <strong>選択肢との一致:</strong>{' '}
              {options.find((opt) => opt.value === selectedValue) ? 'あり' : 'なし'}
            </Typography>
            <Typography variant="body2">
              <strong>フリーワード入力:</strong>{' '}
              {inputValue && !options.find((opt) => opt.label === inputValue) ? 'あり' : 'なし'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 2, bgcolor: '#f9f9f9' }}>
        <Typography variant="subtitle1" gutterBottom>
          イベントログ (最新10件):
        </Typography>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {eventLog.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              まだイベントは発生していません
            </Typography>
          ) : (
            eventLog.map((log, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  mb: 0.5,
                  color: index === 0 ? 'primary.main' : 'text.primary',
                }}
              >
                {log}
              </Typography>
            ))
          )}
        </Box>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          💡 使い方のヒント:
          <br />• ドロップダウンから選択肢を選ぶとonChangeイベントが発生します
          <br />• 自由に文字を入力するとonInputChangeイベントが発生します
          <br />• 選択肢にない値を入力してもエラーになりません
          <br />• フォーカスが外れるとonBlurイベントが発生します
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * フリーワード入力の詳細デモ
 */
export const FreeSoloDetailedDemo: Story = {
  args: Default.args,
  render: FreeSoloDemoComponent,
};

/**
 * 複数のAutoCompleteを連動させる例
 * 国を選択すると、その国の都市が選択可能になります
 */
const LinkedAutoCompletesDemo = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const countryOptions: Option[] = [
    { label: '日本', value: 'japan' },
    { label: 'アメリカ', value: 'usa' },
    { label: 'イギリス', value: 'uk' },
    { label: 'フランス', value: 'france' },
    { label: 'ドイツ', value: 'germany' },
  ];

  const cityData: Record<string, Option[]> = {
    japan: [{ label: '東京', value: 'tokyo' }],
    usa: [{ label: 'ニューヨーク', value: 'ny' }],
    uk: [{ label: 'ロンドン', value: 'london' }],
    france: [{ label: 'パリ', value: 'paris' }],
    germany: [{ label: 'ベルリン', value: 'berlin' }],
  };

  const cityOptions: Option[] =
    selectedCountry && cityData[selectedCountry as keyof typeof cityData]
      ? cityData[selectedCountry as keyof typeof cityData]
      : [];

  const handleCountryChange = (option: Option | null) => {
    setSelectedCountry(option?.value || null);
    setSelectedCity(null);
  };

  const handleCityChange = (option: Option | null) => {
    setSelectedCity(option?.value || null);
  };

  return (
    <Paper sx={{ p: 3, minWidth: 600 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        連動するAutoComplete例
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            国を選択してください
          </Typography>
          <AutoComplete
            name="country"
            options={countryOptions}
            onChange={handleCountryChange}
            helperText="まず国を選択してください"
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            都市を選択してください
          </Typography>
          <AutoComplete
            name="city"
            options={cityOptions}
            disabled={!selectedCountry}
            onChange={handleCityChange}
            helperText={
              selectedCountry ? '都市を選択してください' : '先に国を選択してください'
            }
            key={selectedCountry}
          />
        </Box>

        {selectedCountry && selectedCity && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body1">
              選択結果:{' '}
              {countryOptions.find((c) => c.value === selectedCountry)?.label} -{' '}
              {cityOptions.find((c) => c.value === selectedCity)?.label}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export const LinkedAutoCompletes: Story = {
  args: {
    name: 'linked',
    options: [],
  },
  render: () => <LinkedAutoCompletesDemo />,
};


/**
 * より複雑な3段階連動の例
 * 地域 → 国 → 都市の3段階連動
 */
const ThreeStageLinkedAutoCompletesDemo = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const regionOptions: Option[] = [
    { label: '東アジア', value: 'east_asia' },
    { label: '北アメリカ', value: 'north_america' },
    { label: 'ヨーロッパ', value: 'europe' },
  ];

  const countryData: Record<string, Option[]> = {
    east_asia: [
      { label: '日本', value: 'japan' },
      { label: '韓国', value: 'korea' },
      { label: '中国', value: 'china' },
    ],
    north_america: [
      { label: 'アメリカ', value: 'usa' },
      { label: 'カナダ', value: 'canada' },
      { label: 'メキシコ', value: 'mexico' },
    ],
    europe: [
      { label: 'イギリス', value: 'uk' },
      { label: 'フランス', value: 'france' },
      { label: 'ドイツ', value: 'germany' },
    ],
  };

  const cityData: Record<string, Option[]> = {
    japan: [
      { label: '東京', value: 'tokyo' },
      { label: '大阪', value: 'osaka' },
    ],
    korea: [
      { label: 'ソウル', value: 'seoul' },
      { label: '釜山', value: 'busan' },
    ],
    china: [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
    ],
    usa: [
      { label: 'ニューヨーク', value: 'newyork' },
      { label: 'ロサンゼルス', value: 'losangeles' },
    ],
    canada: [
      { label: 'トロント', value: 'toronto' },
      { label: 'バンクーバー', value: 'vancouver' },
    ],
    mexico: [
      { label: 'メキシコシティ', value: 'mexico_city' },
      { label: 'カンクン', value: 'cancun' },
    ],
    uk: [
      { label: 'ロンドン', value: 'london' },
      { label: 'マンチェスター', value: 'manchester' },
    ],
    france: [
      { label: 'パリ', value: 'paris' },
      { label: 'マルセイユ', value: 'marseille' },
    ],
    germany: [
      { label: 'ベルリン', value: 'berlin' },
      { label: 'ミュンヘン', value: 'munich' },
    ],
  };

  const countryOptions = selectedRegion ? countryData[selectedRegion] || [] : [];
  const cityOptions = selectedCountry ? cityData[selectedCountry] || [] : [];

  const handleRegionChange = (option: Option | null) => {
    setSelectedRegion(option?.value || null);
    setSelectedCountry(null);
    setSelectedCity(null);
  };

  const handleCountryChange = (option: Option | null) => {
    setSelectedCountry(option?.value || null);
    setSelectedCity(null);
  };

  const handleCityChange = (option: Option | null) => {
    setSelectedCity(option?.value || null);
  };

  return (
    <Paper sx={{ p: 3, minWidth: 600 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        3段階連動AutoComplete例
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            1. 地域を選択
          </Typography>
          <AutoComplete
            name="region"
            options={regionOptions}
            onChange={handleRegionChange}
            helperText="地域を選択してください"
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            2. 国を選択
          </Typography>
          <AutoComplete
            name="country"
            options={countryOptions}
            disabled={!selectedRegion}
            onChange={handleCountryChange}
            helperText={selectedRegion ? '国を選択してください' : '先に地域を選択してください'}
            key={`country-${selectedRegion}`}
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            3. 都市を選択
          </Typography>
          <AutoComplete
            name="city"
            options={cityOptions}
            disabled={!selectedCountry}
            onChange={handleCityChange}
            helperText={selectedCountry ? '都市を選択してください' : '先に国を選択してください'}
            key={`city-${selectedCountry}`}
          />
        </Box>

        {selectedRegion && selectedCountry && selectedCity && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              選択完了!
            </Typography>
            <Typography variant="body2">
              地域: {regionOptions.find((r) => r.value === selectedRegion)?.label}
            </Typography>
            <Typography variant="body2">
              国: {countryOptions.find((c) => c.value === selectedCountry)?.label}
            </Typography>
            <Typography variant="body2">
              都市: {cityOptions.find((c) => c.value === selectedCity)?.label}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export const ThreeStageLinkedAutoCompletes: Story = {
  args: {
    name: 'three-stage',
    options: [],
  },
  render: () => <ThreeStageLinkedAutoCompletesDemo />,
};


/**
 * 動的検索を使った連動例
 * カテゴリを選択すると、そのカテゴリに関連する商品が動的に検索される
 */
const DynamicSearchLinkedDemo = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categoryOptions: Option[] = [
    { label: 'エレクトロニクス', value: 'electronics' },
    { label: '衣類', value: 'clothing' },
    { label: '書籍', value: 'books' },
    { label: 'スポーツ', value: 'sports' },
  ];

  const productData: Record<string, Option[]> = {
    electronics: [
      { label: 'iPhone', value: 'iphone' },
      { label: 'MacBook', value: 'macbook' },
      { label: 'iPad', value: 'ipad' },
      { label: 'Apple Watch', value: 'apple_watch' },
    ],
    clothing: [
      { label: 'スーツ', value: 'suit' },
      { label: 'ドレス', value: 'dress' },
      { label: 'ジーンズ', value: 'jeans' },
      { label: 'スニーカー', value: 'sneakers' },
    ],
    books: [
      { label: '小説', value: 'novel' },
      { label: '技術書', value: 'technical' },
      { label: 'ビジネス書', value: 'business' },
      { label: '漫画', value: 'manga' },
    ],
    sports: [
      { label: 'テニスラケット', value: 'tennis_racket' },
      { label: 'サッカーボール', value: 'soccer_ball' },
      { label: 'ランニングシューズ', value: 'running_shoes' },
      { label: 'ヨガマット', value: 'yoga_mat' },
    ],
  };

  const handleCategoryChange = (option: Option | null) => {
    setSelectedCategory(option?.value || null);
    setProductOptions([]);

    if (option?.value) {
      setIsLoading(true);
      setTimeout(() => {
        const products = productData[option.value as keyof typeof productData] || [];
        setProductOptions(products);
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <Paper sx={{ p: 3, minWidth: 600 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        動的検索連動AutoComplete例
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            カテゴリを選択
          </Typography>
          <AutoComplete
            name="category"
            options={categoryOptions}
            onChange={handleCategoryChange}
            helperText="商品カテゴリを選択してください"
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            商品を選択
          </Typography>
          <AutoComplete
            name="product"
            options={productOptions}
            disabled={!selectedCategory || isLoading}
            helperText={
              isLoading
                ? '商品を読み込み中...'
                : selectedCategory
                ? '商品を選択してください'
                : '先にカテゴリを選択してください'
            }
            key={selectedCategory}
          />
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              商品データを取得中...
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export const DynamicSearchLinked: Story = {
  args: {
    name: 'dynamic',
    options: [],
  },
  render: () => <DynamicSearchLinkedDemo />,
};

/**
 * TextBoxとAutoCompleteの連動例
 * 郵便番号を入力すると住所が自動補完される
 */
const TextBoxWithAutoCompleteDemo = () => {
  const [postalCode, setPostalCode] = useState<string>('');
  const [addressOptions, setAddressOptions] = useState<Option[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const postalCodeDatabase: Record<string, Option[]> = {
    '1000001': [{ label: '東京都千代田区千代田', value: 'tokyo-chiyoda-chiyoda' }],
    '1000002': [{ label: '東京都千代田区皇居外苑', value: 'tokyo-chiyoda-kokyo' }],
    '1500001': [{ label: '東京都渋谷区神宮前', value: 'tokyo-shibuya-jingumae' }],
    '1600023': [{ label: '東京都新宿区西新宿', value: 'tokyo-shinjuku-nishishinjuku' }],
    '5410041': [{ label: '大阪府大阪市中央区北浜', value: 'osaka-chuo-kitahama' }],
    '5410042': [{ label: '大阪府大阪市中央区今橋', value: 'osaka-chuo-imabashi' }],
    '2310045': [{ label: '神奈川県横浜市中区伊勢佐木町', value: 'kanagawa-yokohama-isezakicho' }],
  };

  const handlePostalCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setPostalCode(value);
    setSelectedAddress(null);
    setAddressOptions([]);

    if (value.length === 7) {
      setIsSearching(true);
      setTimeout(() => {
        const addresses = postalCodeDatabase[value as keyof typeof postalCodeDatabase] || [];
        if (addresses.length > 0) {
          setAddressOptions(addresses);
        } else {
          setAddressOptions([{ label: '該当する住所が見つかりません', value: 'not-found' }]);
        }
        setIsSearching(false);
      }, 800);
    }
  };

  const handleAddressChange = (option: Option | null) => {
    setSelectedAddress(option?.value || null);
  };

  const formatPostalCode = (value: string) => {
    if (value.length <= 3) return value;
    return `${value.slice(0, 3)}-${value.slice(3)}`;
  };

  const handleReset = () => {
    setPostalCode('');
    setAddressOptions([]);
    setSelectedAddress(null);
  };

  return (
    <Paper sx={{ p: 3, minWidth: 700 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        TextBox + AutoComplete連動例
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            郵便番号を入力してください
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextBox
              name="postalCode"
              type="text"
              value={formatPostalCode(postalCode)}
              onChange={handlePostalCodeChange}
              maxLength={8}
              helperText="7桁の郵便番号を入力（例：1000001）"
              clearButton={true}
              clearButtonOnClick={() => setPostalCode('')}
              customStyle={{ width: '200px' }}
            />
            <Typography variant="body2" color="text.secondary">
              {postalCode.length}/7桁
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            住所を選択してください
          </Typography>
          <AutoComplete
            name="address"
            options={addressOptions}
            disabled={addressOptions.length === 0 || isSearching}
            onChange={handleAddressChange}
            helperText={
              isSearching
                ? '住所を検索中...'
                : addressOptions.length > 0
                ? '該当する住所から選択してください'
                : '郵便番号を入力すると住所が表示されます'
            }
            key={postalCode}
          />
        </Box>

        {isSearching && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="primary">
              住所データベースを検索中...
            </Typography>
          </Box>
        )}

        {postalCode && selectedAddress && selectedAddress !== 'not-found' && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              入力完了!
            </Typography>
            <Typography variant="body2">郵便番号: {formatPostalCode(postalCode)}</Typography>
            <Typography variant="body2">
              住所: {addressOptions.find((addr) => addr.value === selectedAddress)?.label}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            リセット
          </button>
        </Box>
      </Box>
    </Paper>
  );
};

export const TextBoxWithAutoComplete: Story = {
  args: {
    name: 'textbox-linked',
    options: [],
  },
  render: () => <TextBoxWithAutoCompleteDemo />,
};

/**
 * フリーテキスト入力とAutoCompleteの組み合わせ例
 * 商品名を自由入力すると、関連する商品が候補に表示される
 */
const FreeTextWithSuggestionsDemo = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [suggestionOptions, setSuggestionOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const productDatabase = [
    {
      label: 'iPhone 15 Pro',
      value: 'iphone-15-pro',
      keywords: ['iphone', 'apple', 'スマホ', 'スマートフォン'],
    },
    {
      label: 'iPhone 15',
      value: 'iphone-15',
      keywords: ['iphone', 'apple', 'スマホ', 'スマートフォン'],
    },
    {
      label: 'MacBook Pro',
      value: 'macbook-pro',
      keywords: ['macbook', 'apple', 'ノートパソコン', 'PC'],
    },
    {
      label: 'MacBook Air',
      value: 'macbook-air',
      keywords: ['macbook', 'apple', 'ノートパソコン', 'PC'],
    },
    { label: 'iPad Pro', value: 'ipad-pro', keywords: ['ipad', 'apple', 'タブレット'] },
    { label: 'iPad Air', value: 'ipad-air', keywords: ['ipad', 'apple', 'タブレット'] },
    {
      label: 'Samsung Galaxy',
      value: 'samsung-galaxy',
      keywords: ['samsung', 'galaxy', 'スマホ', 'android'],
    },
    {
      label: 'Dell XPS',
      value: 'dell-xps',
      keywords: ['dell', 'ノートパソコン', 'PC', 'windows'],
    },
    {
      label: 'Surface Pro',
      value: 'surface-pro',
      keywords: ['microsoft', 'surface', 'タブレット', 'PC'],
    },
  ];

  const handleSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    setSelectedSuggestion(null);

    if (value.length >= 2) {
      const filtered = productDatabase.filter(
        (product) =>
          product.label.toLowerCase().includes(value.toLowerCase()) ||
          product.keywords.some((keyword) => keyword.toLowerCase().includes(value.toLowerCase()))
      );
      setSuggestionOptions(filtered.slice(0, 5));
    } else {
      setSuggestionOptions([]);
    }
  };

  const handleSuggestionChange = (option: { label: string; value: string } | null) => {
    setSelectedSuggestion(option?.value || null);
    if (option) {
      setSearchText(option.label);
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSuggestionOptions([]);
    setSelectedSuggestion(null);
  };

  return (
    <Paper sx={{ p: 3, minWidth: 700 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        フリーテキスト + 候補提案例
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            商品名を入力してください
          </Typography>
          <TextBox
            name="productSearch"
            type="text"
            value={searchText}
            onChange={handleSearchTextChange}
            helperText="2文字以上入力すると候補が表示されます"
            clearButton={true}
            clearButtonOnClick={handleClearSearch}
            customStyle={{ width: '400px' }}
          />
        </Box>

        {suggestionOptions.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              候補から選択（任意）
            </Typography>
            <AutoComplete
              name="productSuggestion"
              options={suggestionOptions}
              onChange={handleSuggestionChange}
              helperText="候補から選択するか、上記のテキストボックスで自由入力できます"
              key={searchText}
            />
          </Box>
        )}

        {searchText && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              入力内容:
            </Typography>
            <Typography variant="body2">商品名: {searchText}</Typography>
            {selectedSuggestion && (
              <Typography variant="body2" color="primary">
                候補から選択: あり
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{ mt: 1, fontSize: '0.8rem', color: 'text.secondary' }}
            >
              候補にない商品でも自由に入力できます
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export const FreeTextWithSuggestions = {
  args: {
    name: 'free-text',
    options: [],
  },
  render: () => <FreeTextWithSuggestionsDemo />,
};

/**
 * 数値入力とカテゴリ選択の連動例
 * 価格帯を入力すると、その価格帯の商品カテゴリが表示される
 */
const NumericInputWithCategoriesDemo = () => {
  const [priceFrom, setPriceFrom] = useState<string>('');
  const [priceTo, setPriceTo] = useState<string>('');
  const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getCategoriesByPriceRange = (from: number, to: number) => {
    const categories = [];
    if (from <= 1000 && to >= 100) {
      categories.push({ label: '文房具', value: 'stationery' });
      categories.push({ label: '小物・雑貨', value: 'accessories' });
    }
    if (from <= 10000 && to >= 1000) {
      categories.push({ label: '衣類・ファッション', value: 'fashion' });
      categories.push({ label: '書籍・DVD', value: 'books' });
      categories.push({ label: 'スポーツ用品', value: 'sports' });
    }
    if (from <= 100000 && to >= 10000) {
      categories.push({ label: '家電・電化製品', value: 'electronics' });
      categories.push({ label: '家具・インテリア', value: 'furniture' });
    }
    if (from <= 1000000 && to >= 100000) {
      categories.push({ label: 'パソコン・IT機器', value: 'computers' });
      categories.push({ label: '車・バイク用品', value: 'automotive' });
    }
    if (to >= 1000000) {
      categories.push({ label: '高級品・宝飾品', value: 'luxury' });
      categories.push({ label: '不動産', value: 'realestate' });
    }
    return categories;
  };

  const updatePriceRange = () => {
    const fromNum = parseInt(priceFrom) || 0;
    const toNum = parseInt(priceTo) || 0;
    if (fromNum > 0 && toNum > 0 && fromNum <= toNum) {
      const categories = getCategoriesByPriceRange(fromNum, toNum);
      setCategoryOptions(categories);
      setSelectedCategory(null);
    } else {
      setCategoryOptions([]);
      setSelectedCategory(null);
    }
  };

  const handlePriceFromChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPriceFrom(event.target.value.replace(/[^0-9]/g, ''));
  };

  const handlePriceToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPriceTo(event.target.value.replace(/[^0-9]/g, ''));
  };

  const handleCategoryChange = (option: { label: string; value: string } | null) => {
    setSelectedCategory(option?.value || null);
  };

  const formatNumber = (num: string) => {
    if (!num) return '';
    return parseInt(num).toLocaleString();
  };

  return (
    <Paper sx={{ p: 3, minWidth: 700 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        数値入力 + カテゴリ選択連動例
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>価格帯（から）</Typography>
            <TextBox
              name="priceFrom"
              type="text"
              value={priceFrom}
              onChange={handlePriceFromChange}
              unit="円"
              helperText="最低価格を入力"
              customStyle={{ width: '200px' }}
            />
            {priceFrom && <Typography variant="caption" color="text.secondary">{formatNumber(priceFrom)}円</Typography>}
          </Box>
          <Typography variant="h6" sx={{ mt: 2 }}>〜</Typography>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>価格帯（まで）</Typography>
            <TextBox
              name="priceTo"
              type="text"
              value={priceTo}
              onChange={handlePriceToChange}
              unit="円"
              helperText="最高価格を入力"
              customStyle={{ width: '200px' }}
            />
            {priceTo && <Typography variant="caption" color="text.secondary">{formatNumber(priceTo)}円</Typography>}
          </Box>
          <button
            onClick={updatePriceRange}
            disabled={!priceFrom || !priceTo || parseInt(priceFrom) > parseInt(priceTo)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px',
              opacity: !priceFrom || !priceTo || parseInt(priceFrom) > parseInt(priceTo) ? 0.5 : 1,
            }}
          >
            検索
          </button>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>該当するカテゴリ</Typography>
          <AutoComplete
            name="category"
            options={categoryOptions}
            disabled={categoryOptions.length === 0}
            onChange={handleCategoryChange}
            helperText={
              categoryOptions.length > 0
                ? '価格帯に該当するカテゴリから選択してください'
                : '価格帯を入力して検索ボタンを押してください'
            }
            key={`${priceFrom}-${priceTo}`}
          />
        </Box>

        {priceFrom && priceTo && selectedCategory && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>検索条件:</Typography>
            <Typography variant="body2">価格帯: {formatNumber(priceFrom)}円 〜 {formatNumber(priceTo)}円</Typography>
            <Typography variant="body2">カテゴリ: {categoryOptions.find((cat) => cat.value === selectedCategory)?.label}</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// export const NumericInputWithCategories = {
//   args: {
//     name: 'numeric-linked',
//     options: [],
//   },
//   render: () => <NumericInputWithCategoriesDemo />,
//  * freeSolo機能修正の確認用 - 通常モードとfreeSoloモードの比較
//  */
// export const FreeSoloComparison: Story = {
//   args: Default.args,
//   render: () => (
//     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: 600 }}>
//       <Typography variant="h6">FreeSolo機能修正の確認</Typography>

//       <Box>
//         <Typography variant="subtitle1" gutterBottom>
//           1. 通常モード（freeSolo=false）
//         </Typography>
//         <AutoComplete
//           name="normal"
//           options={[
//             { label: 'Apple', value: 'apple' },
//             { label: 'Banana', value: 'banana' },
//             { label: 'Cherry', value: 'cherry' },
//           ]}
//           freeSolo={false}
//           helperText="選択肢からのみ選択可能。自由入力はできません。"
//         />
//       </Box>

//       <Box>
//         <Typography variant="subtitle1" gutterBottom>
//           2. FreeSoloモード（freeSolo=true）- 修正後
//         </Typography>
//         <AutoComplete
//           name="freesolo"
//           options={[
//             { label: 'Apple', value: 'apple' },
//             { label: 'Banana', value: 'banana' },
//             { label: 'Cherry', value: 'cherry' },
//           ]}
//           freeSolo={true}
//           helperText="✅ ドロップダウンアイコンが表示され、選択肢も表示されます。フォーカス時に自動でドロップダウンが開きます。"
//         />
//       </Box>

//       <Paper sx={{ p: 2, bgcolor: '#e8f5e8' }}>
//         <Typography variant="body2">
//           <strong>🔧 FreeSolo修正内容:</strong>
//         </Typography>
//         <Typography variant="body2">
//           ✅ <code>forcePopupIcon={"{freeSolo}"}</code> - freeSoloモードでもドロップダウンアイコンを表示<br/>
//           ✅ <code>openOnFocus={"{freeSolo}"}</code> - フォーカス時にドロップダウンを自動で開く<br/>
//           ✅ <code>selectOnFocus={"{false}"}</code> - フォーカス時の自動選択を無効化<br/>
//           ✅ <code>handleHomeEndKeys={"{true}"}</code> - HomeとEndキーでのナビゲーションを有効化<br/>
//           ✅ freeSoloモードでも選択肢から選ぶことと自由入力の両方が可能
//         </Typography>
//       </Paper>

//       <Paper sx={{ p: 2, bgcolor: '#fff3cd' }}>
//         <Typography variant="body2">
//           <strong>💡 使い方のヒント:</strong>
//         </Typography>
//         <Typography variant="body2">
//           • FreeSoloモードの入力欄をクリックまたはフォーカス → 自動でドロップダウンが開きます<br/>
//           • ドロップダウンアイコンをクリック → 選択肢が表示されます<br/>
//           • 選択肢から選択 → 通常通り選択可能です<br/>
//           • 自由入力 → 選択肢にない値も入力できます<br/>
//           • 選択後の編集 → 選択した値を編集することもできます
//         </Typography>
//       </Paper>
//     </Box>
//   ),
// };


/**
 * スタイル修正の確認用 - 有効と無効の比較
 */
export const StyleComparison: Story = {
  args: Default.args,
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: 600 }}>
      <Typography variant="h6">AutoCompleteスタイル比較</Typography>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          1. 通常状態（有効）
        </Typography>
        <AutoComplete
          name="enabled"
          options={[
            { label: '日本', value: 'japan' },
            { label: 'アメリカ', value: 'usa' },
            { label: 'イギリス', value: 'uk' },
          ]}
          defaultValue="japan"
          disabled={false}
          helperText="通常の状態 - 下向き矢印が表示され、クリック可能"
        />
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          2. 無効状態（disabled）
        </Typography>
        <AutoComplete
          name="disabled"
          options={[
            { label: '日本', value: 'japan' },
            { label: 'アメリカ', value: 'usa' },
            { label: 'イギリス', value: 'uk' },
          ]}
          defaultValue="japan"
          disabled={true}
          helperText="無効状態 - 背景とテキストがグレー、下向き矢印は表示される"
        />
      </Box>

      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="body2">
          <strong>修正内容:</strong>
        </Typography>
        <Typography variant="body2">
          ✅ disabled状態で背景色がグレー（rgba(0, 0, 0, 0.12)）に変更<br/>
          ✅ disabled状態でテキスト色がグレー（rgba(0, 0, 0, 0.38)）に変更<br/>
          ✅ 下向き矢印（popupIndicator）が確実に表示されるよう修正<br/>
          ✅ Webkit系ブラウザでのテキスト色も適切に設定<br/>
          ✅ スタイル設定の重複を解消し、TextFieldで一元管理
        </Typography>
      </Paper>
    </Box>
  ),
};
