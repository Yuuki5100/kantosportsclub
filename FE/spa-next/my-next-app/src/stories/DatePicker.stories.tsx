import { DatePicker } from '@/components/base/Input';
import { DatePickerProps } from '@/components/base/Input/DatePicker';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React from 'react';

// Dayjs型のvalue属性をStorybook Controlsで扱うためのインターフェース
interface DatePickerStoryProps extends Omit<DatePickerProps, 'value' | 'minDate' | 'maxDate'> {
  value?: string; // 文字列として受け取る
  minDate?: string; // 文字列として受け取る
  maxDate?: string; // 文字列として受け取る
}

const meta: Meta<DatePickerStoryProps> = {
  title: 'Common-architecture/DatePicker',
  component: DatePicker,
  parameters: {
    // 中心に表示
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
      description: '日付の値 (YYYY-MM-DD形式で入力してください)',
    },
    minDate: {
      control: { type: 'text' },
      description: '最小日付 (YYYY-MM-DD形式で入力してください)',
    },
    maxDate: {
      control: { type: 'text' },
      description: '最大日付 (YYYY-MM-DD形式で入力してください)',
    },
    allowedDaysOfWeek: {
      control: {
        type: 'check',
        labels: {
          0: '日曜日',
          1: '月曜日',
          2: '火曜日',
          3: '水曜日',
          4: '木曜日',
          5: '金曜日',
          6: '土曜日'
        }
      },
      options: [0, 1, 2, 3, 4, 5, 6],
      description: '選択可能な曜日 (0:日曜日, 1:月曜日, 2:火曜日, 3:水曜日, 4:木曜日, 5:金曜日, 6:土曜日)',
    },
    label: {
      control: { type: 'text' },
      description: 'ラベルテキスト',
    },
    helperText: {
      control: { type: 'text' },
      description: 'ヘルパーテキスト',
    },
    error: {
      control: { type: 'boolean' },
      description: 'エラー状態の表示切り替え',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '無効化状態の切り替え',
    },
    // format: {
    //   control: { type: 'text' },
    //   description: '日付フォーマット',
    // },
    onChange: {
      action: 'onChange',
      description: '日付変更時のコールバック',
    },
    onBlur: {
      action: 'onBlur',
      description: 'フォーカスが外れた時のコールバック',
    },
  }
} satisfies Meta<DatePickerStoryProps>;
export default meta;

type Story = StoryObj<typeof meta>;

// 文字列をDayjsオブジェクトに変換するヘルパー関数
const convertStringToDayjs = (dateString?: string): Dayjs | undefined => {
  if (!dateString) return undefined;
  const parsedDate = dayjs(dateString);
  return parsedDate.isValid() ? parsedDate : undefined;
};

// ストーリー（使用例）
// Controlsを使用するために引数にpropsを指定
export const MyDatePicker = (args: DatePickerStoryProps) => {
  // 文字列の日付をDayjsに変換
  const value = convertStringToDayjs(args.value);
  const minDate = convertStringToDayjs(args.minDate);
  const maxDate = convertStringToDayjs(args.maxDate);

  return (
    <DatePicker
      {...args}
      value={value}
      minDate={minDate}
      maxDate={maxDate}
      onChange={(newValue) => {
        args.onChange?.(newValue);
        console.log('Selected date:', newValue?.format('YYYY-MM-DD'));
      }}
    />
  );
};

// MyDatePickerのデフォルト引数を設定
MyDatePicker.args = {
  label: '日付を選択してください',
  helperText: 'Controlsパネルで日付を YYYY-MM-DD 形式で入力できます（例: 2024-01-15）',
  value: '2024-01-15', // デフォルト値
  format: 'YYYY/MM/DD',
  error: false,
  disabled: false,
  allowedDaysOfWeek: undefined, // デフォルトは全日選択可能
};

export const MyDatePickerWithLabel = () => (
  <DatePicker
    label="日付ラベルを使用"
    onChange={(date) => {
      console.log(date);
    }}
  />
);

/**
 * Controlsパネルでの日付入力テスト用ストーリー
 * この例では、Controlsパネルから日付や各種設定を変更できます
 */
export const ControlsTest: Story = {
  render: (args: DatePickerStoryProps) => {
    const value = convertStringToDayjs(args.value);
    const minDate = convertStringToDayjs(args.minDate);
    const maxDate = convertStringToDayjs(args.maxDate);

    return (
      <div style={{ padding: '20px' }}>
        <h3>Controlsテスト用DatePicker</h3>
        <p>右側のControlsパネルから以下を試してください：</p>
        <ul>
          <li>value: 2024-12-25 (YYYY-MM-DD形式)</li>
          <li>minDate: 2024-01-01</li>
          <li>maxDate: 2024-12-31</li>
          <li>label: 任意のラベル</li>
          <li>helperText: 任意のヘルプテキスト</li>
          <li>error: true/false</li>
          <li>disabled: true/false</li>
        </ul>

        <DatePicker
          {...args}
          value={value}
          minDate={minDate}
          maxDate={maxDate}
          onChange={(newValue) => {
            args.onChange?.(newValue);
            console.log('Controls Test - Selected date:', newValue?.format('YYYY-MM-DD'));
          }}
          onBlur={(event) => {
            args.onBlur?.(event);
            console.log('Controls Test - onBlur triggered:', event.target.value);
          }}
        />

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <strong>現在の設定:</strong>
          <ul>
            <li>value: {args.value || '未設定'}</li>
            <li>minDate: {args.minDate || '未設定'}</li>
            <li>maxDate: {args.maxDate || '未設定'}</li>
            <li>error: {args.error ? 'true' : 'false'}</li>
            <li>disabled: {args.disabled ? 'true' : 'false'}</li>
          </ul>
        </div>
      </div>
    );
  },
  args: {
    label: 'Controlsテスト用DatePicker',
    helperText: 'Controlsパネルから設定を変更してテストしてください',
    value: '2024-01-15',
    minDate: '2024-01-01',
    maxDate: '2024-12-31',
    format: 'YYYY/MM/DD',
    error: false,
    disabled: false,
    allowedDaysOfWeek: undefined, // デフォルトは全日選択可能
  },
};

/**
 * ヘルパーテキストを表示する例
 */
export const WithHelperText: Story = {
  args: {
    label: '日付を選択',
    helperText: 'YYYY/MM/DD形式で入力してください',
    error: true
  },
};

/**
 * onBlurイベントをテストする例
 * フィールドからフォーカスが外れた時にコンソールにメッセージを出力
 * カレンダーボタンクリック時はonBlurが発火しないことを確認
 */
export const WithOnBlur: Story = {
  args: {
    label: 'onBlurテスト用（改良版）',
    helperText: 'テキスト入力後、カレンダーボタンをクリックしてもonBlurが発火しないことを確認してください',
    onBlur: fn((event) => {
      console.log('DatePicker onBlur triggered:', event.target.value);
      alert('DatePickerからフォーカスが外れました！（真の外部フォーカス移動）');
    }),
  },
};

/**
 * onBlurとonChangeの組み合わせテスト
 * 値の変更とフォーカス移動を両方監視
 */
export const WithOnBlurAndOnChange = () => {
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | undefined>(undefined);

  return (
    <DatePicker
      label="onBlur + onChange テスト"
      helperText="日付を選択してフィールドからフォーカスを外してください"
      value={selectedDate}
      onChange={(newValue) => {
        console.log('DatePicker onChange:', newValue);
        setSelectedDate(newValue);
      }}
      onBlur={(event) => {
        console.log('DatePicker onBlur:', event.target.value);
        console.log('Current selected date:', selectedDate);
        alert(`フォーカスが外れました。入力値: ${event.target.value}`);
      }}
    />
  );
};

/**
 * バリデーション付きonBlurテスト
 * フォーカスが外れた時に入力値をバリデーション
 */
export const WithValidationOnBlur = () => {
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | undefined>(undefined);
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState('日付を入力してください');

  const handleBlur = (event:React.FocusEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    console.log('Validation onBlur:', inputValue);

    if (!inputValue) {
      setError(true);
      setHelperText('日付は必須です');
      alert('エラー: 日付が入力されていません');
    } else if (!selectedDate) {
      setError(true);
      setHelperText('正しい日付形式で入力してください');
      alert('エラー: 正しい日付形式ではありません');
    } else {
      setError(false);
      setHelperText('日付が正しく入力されました');
      alert('成功: 日付が正しく入力されました');
    }
  };

  return (
    <DatePicker
      label="バリデーション付きonBlur"
      helperText={helperText}
      error={error}
      value={selectedDate}
      onChange={(newValue) => {
        setSelectedDate(newValue);
        // 値が変更されたらエラー状態をリセット
        if (newValue) {
          setError(false);
          setHelperText('日付を入力してください');
        }
      }}
      onBlur={handleBlur}
    />
  );
};

/**
 * 完全なonBlurパターンテスト
 * 4つのパターンすべてをテスト：
 * 1. テキストエリア→外 発火
 * 2. テキストエリア→カレンダー 不発
 * 3. カレンダー→外 発火
 * 4. カレンダー→テキストエリア 不発
 */
/**
 * 曜日制限機能のテスト - 平日のみ
 */
export const WeekdaysOnly: Story = {
  args: {
    label: '平日のみ選択可能',
    helperText: '月曜日から金曜日のみ選択できます',
    allowedDaysOfWeek: [1, 2, 3, 4, 5], // 月～金
  },
};

/**
 * 曜日制限機能のテスト - 週末のみ
 */
export const WeekendsOnly: Story = {
  args: {
    label: '週末のみ選択可能',
    helperText: '土曜日と日曜日のみ選択できます',
    allowedDaysOfWeek: [0, 6], // 日、土
  },
};

/**
 * 曜日制限機能のテスト - 特定曜日のみ
 */
export const SpecificDaysOnly: Story = {
  args: {
    label: '月・水・金のみ選択可能',
    helperText: '月曜日、水曜日、金曜日のみ選択できます',
    allowedDaysOfWeek: [1, 3, 5], // 月、水、金
  },
};

/**
 * 曜日制限機能のテスト - 制限なし（空配列）
 */
export const NoRestrictionsEmptyArray: Story = {
  args: {
    label: '制限なし（空配列）',
    helperText: 'allowedDaysOfWeek=[]で全日選択可能',
    allowedDaysOfWeek: [], // 空配列 → 全日選択可能
  },
};

/**
 * 曜日制限とその他制限の組み合わせテスト
 */
export const CombinedRestrictions = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h3>曜日制限と日付範囲制限の組み合わせ</h3>

      <div>
        <h4>1. 平日のみ + 今月のみ</h4>
        <DatePicker
          label="平日かつ今月のみ"
          helperText="月～金曜日で、かつ今月の日付のみ選択可能"
          allowedDaysOfWeek={[1, 2, 3, 4, 5]}
          minDate={dayjs().startOf('month')}
          maxDate={dayjs().endOf('month')}
          onChange={(date) => console.log('平日+今月:', date?.format('YYYY-MM-DD dddd'))}
        />
      </div>

      <div>
        <h4>2. 週末のみ + 未来の日付のみ</h4>
        <DatePicker
          label="週末かつ未来の日付のみ"
          helperText="土日で、かつ今日以降の日付のみ選択可能"
          allowedDaysOfWeek={[0, 6]}
          minDate={dayjs()}
          onChange={(date) => console.log('週末+未来:', date?.format('YYYY-MM-DD dddd'))}
        />
      </div>

      <div>
        <h4>3. 制限なし（比較用）</h4>
        <DatePicker
          label="制限なし"
          helperText="すべての日付が選択可能"
          onChange={(date) => console.log('制限なし:', date?.format('YYYY-MM-DD dddd'))}
        />
      </div>

      <div style={{ padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
        <strong>テスト方法:</strong>
        <ul>
          <li>各DatePickerでカレンダーを開いて、グレーアウトされた日付を確認</li>
          <li>選択可能な日付のパターンが正しいかチェック</li>
          <li>F12でコンソールを開いて選択結果を確認</li>
          <li>制限の組み合わせが適切に動作するか確認</li>
        </ul>
      </div>
    </div>
  );
};

export const CompleteOnBlurPatternTest = () => {
  const [blurCount, setBlurCount] = React.useState(0);
  const [lastBlurTime, setLastBlurTime] = React.useState<string>('');
  const [lastBlurSource, setLastBlurSource] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | undefined>(undefined);
  const [events, setEvents] = React.useState<string[]>([]);

  const addEvent = (eventType: string) => {
    const now = new Date().toLocaleTimeString();
    const eventMessage = `${now}: ${eventType}`;
    setEvents(prev => [eventMessage, ...prev.slice(0, 9)]); // 最新10件を保持
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const now = new Date().toLocaleTimeString();
    setBlurCount(prev => prev + 1);
    setLastBlurTime(now);

    // イベントのソースを判定
    const isFromInput = event.target.tagName === 'INPUT';
    const source = isFromInput ? 'テキストエリア' : 'カレンダー';
    setLastBlurSource(source);

    const eventMessage = `onBlur発火 #${blurCount + 1} - ${source}から外部へ`;
    console.log(eventMessage, {
      target: event.target,
      relatedTarget: event.relatedTarget,
      targetValue: event.target.value
    });
    addEvent(eventMessage);
  };

  const handleFocus = () => {
    addEvent('フォーカス取得');
  };

  const handleCalendarOpen = () => {
    addEvent('カレンダー開く');
  };

  const handleCalendarClose = () => {
    addEvent('カレンダー閉じる');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h4>完全なonBlurパターンテスト</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <p><strong>onBlur発火回数:</strong> {blurCount}</p>
            <p><strong>最後の発火時刻:</strong> {lastBlurTime || '未発火'}</p>
            <p><strong>最後の発火元:</strong> {lastBlurSource || '-'}</p>
          </div>
          <div>
            <p><strong>期待される動作:</strong></p>
            <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '15px' }}>
              <li>テキストエリア→外部 = 発火 ✓</li>
              <li>テキストエリア→カレンダー = 不発 ✗</li>
              <li>カレンダー→外部 = 発火 ✓</li>
              <li>カレンダー→テキストエリア = 不発 ✗</li>
            </ul>
          </div>
        </div>

        <details>
          <summary>テスト手順（クリックして展開）</summary>
          <ol style={{ fontSize: '12px', marginTop: '10px' }}>
            <li><strong>パターン1:</strong> テキストフィールドクリック → 外部ボタンクリック → onBlur発火確認 ✓</li>
            <li><strong>パターン2:</strong> テキストフィールドクリック → カレンダーアイコンクリック → onBlur不発確認 ❌（修正対象）</li>
            <li><strong>パターン3:</strong> カレンダー開く → 日付選択 → 外部ボタンクリック → onBlur発火確認</li>
            <li><strong>パターン4:</strong> カレンダー開く → テキストフィールドクリック → onBlur不発確認</li>
            <li><strong>デバッグ:</strong> F12でコンソールを開いて詳細ログを確認</li>
          </ol>
          <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
            <strong>⚠️ 既知の問題:</strong> カレンダーアイコンクリック時にonBlurが発火する場合があります。<br/>
            コンソールログでrelatedTargetの詳細を確認してください。
          </div>
        </details>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <DatePicker
          label="onBlur完全テスト用DatePicker"
          helperText="上記4パターンをテストしてください"
          value={selectedDate}
          onChange={(newValue) => {
            console.log('DatePicker onChange:', newValue);
            setSelectedDate(newValue);
            addEvent(`日付変更: ${newValue ? newValue.format('YYYY/MM/DD') : 'クリア'}`);
          }}
          onBlur={handleBlur}
          // onFocus={handleFocus}
        />

        <button
          onClick={() => addEvent('外部ボタンクリック')}
          style={{ padding: '8px 16px', height: 'fit-content' }}
        >
          外部ボタン
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h5>イベントログ（最新10件）</h5>
          <div style={{
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '10px',
            height: '200px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {events.length === 0 ? (
              <div style={{ color: '#666' }}>イベントログが表示されます...</div>
            ) : (
              events.map((event, index) => (
                <div key={index} style={{
                  marginBottom: '2px',
                  color: event.includes('onBlur発火') ? '#d73a49' : '#6f42c1'
                }}>
                  {event}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h5>コントロール</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => {
              setBlurCount(0);
              setLastBlurTime('');
              setLastBlurSource('');
              setSelectedDate(undefined);
              setEvents([]);
              addEvent('リセット実行');
            }}>
              全てリセット
            </button>

            <button onClick={() => setEvents([])}>
              ログクリア
            </button>

            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              <p><strong>ヒント:</strong></p>
              <ul style={{ paddingLeft: '15px', margin: 0 }}>
                <li>コンソールにも詳細ログが出力されます</li>
                <li>onBlur発火は赤色で表示されます</li>
                <li>内部フォーカス移動は記録されません</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * allowedDaysOfWeek機能のデバッグ用ストーリー
 */
/**
 * ユーザーが自由に入力できるインタラクティブなデモ
 * リアルタイムで設定を変更しながら動作を確認できます
 */
export const InteractiveDemo = () => {
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | undefined>(dayjs());
  const [minDate, setMinDate] = React.useState<string>('');
  const [maxDate, setMaxDate] = React.useState<string>('');
  const [label, setLabel] = React.useState<string>('日付を選択してください');
  const [helperText, setHelperText] = React.useState<string>('自由に日付を選択できます');
  const [error, setError] = React.useState<boolean>(false);
  const [disabled, setDisabled] = React.useState<boolean>(false);
  const [format, setFormat] = React.useState<string>('YYYY/MM/DD');
  const [allowedDays, setAllowedDays] = React.useState<number[]>([]);

  const convertStringToDayjs = (dateString: string): Dayjs | undefined => {
    if (!dateString) return undefined;
    const parsedDate = dayjs(dateString);
    return parsedDate.isValid() ? parsedDate : undefined;
  };

  const dayOptions = [
    { value: 0, label: '日曜日' },
    { value: 1, label: '月曜日' },
    { value:2, label: '火曜日' },
    { value: 3, label: '水曜日' },
    { value: 4, label: '木曜日' },
    { value: 5, label: '金曜日' },
    { value: 6, label: '土曜日' }
  ];

  const handleDayToggle = (day: number) => {
    setAllowedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const quickSettings = [
    { 
      name: '平日のみ', 
      config: () => {
        setAllowedDays([1, 2, 3, 4, 5]);
        setHelperText('月曜日から金曜日のみ選択可能です');
      }
    },
    { 
      name: '週末のみ', 
      config: () => {
        setAllowedDays([0, 6]);
        setHelperText('土曜日と日曜日のみ選択可能です');
      }
    },
    { 
      name: '今月のみ', 
      config: () => {
        setMinDate(dayjs().startOf('month').format('YYYY-MM-DD'));
        setMaxDate(dayjs().endOf('month').format('YYYY-MM-DD'));
        setHelperText('今月の日付のみ選択可能です');
      }
    },
    { 
      name: '未来の日付のみ', 
      config: () => {
        setMinDate(dayjs().format('YYYY-MM-DD'));
        setMaxDate('');
        setHelperText('今日以降の日付のみ選択可能です');
      }
    },
    { 
      name: 'すべてリセット', 
      config: () => {
        setAllowedDays([]);
        setMinDate('');
        setMaxDate('');
        setError(false);
        setDisabled(false);
        setFormat('YYYY/MM/DD');
        setLabel('日付を選択してください');
        setHelperText('自由に日付を選択できます');
        setSelectedDate(dayjs());
      }
    }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🎯 インタラクティブDatePickerデモ</h2>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        下記の設定を自由に変更して、DatePickerの動作を確認してください。
        リアルタイムで設定が反映されます。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* 左側: 設定パネル */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h3>⚙️ 設定パネル</h3>

          {/* クイック設定 */}
          <div style={{ marginBottom: '20px' }}>
            <h4>🚀 クイック設定</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickSettings.map((setting, index) => (
                <button
                  key={index}
                  onClick={setting.config}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #007bff',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {setting.name}
                </button>
              ))}
            </div>
          </div>

          {/* 基本設定 */}
          <div style={{ marginBottom: '20px' }}>
            <h4>📝 基本設定</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>ラベル:</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>ヘルパーテキスト:</label>
                <input
                  type="text"
                  value={helperText}
                  onChange={(e) => setHelperText(e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>フォーマット:</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>
            </div>
          </div>

          {/* 日付範囲設定 */}
          <div style={{ marginBottom: '20px' }}>
            <h4>📅 日付範囲制限</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>最小日付 (YYYY-MM-DD):</label>
                <input
                  type="date"
                  value={minDate}
                  onChange={(e) => setMinDate(e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>最大日付 (YYYY-MM-DD):</label>
                <input
                  type="date"
                  value={maxDate}
                  onChange={(e) => setMaxDate(e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          {/* 曜日制限設定 */}
          <div style={{ marginBottom: '20px' }}>
            <h4>📆 曜日制限</h4>
            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>
              選択可能な曜日をチェックしてください（未選択の場合は全日選択可能）:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {dayOptions.map((day) => (
                <label key={day.value} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={allowedDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    style={{ marginRight: '6px' }}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>

          {/* 状態設定 */}
          <div style={{ marginBottom: '20px' }}>
            <h4>🎛️ 状態設定</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={error}
                  onChange={(e) => setError(e.target.checked)}
                  style={{ marginRight: '6px' }}
                />
                エラー状態
              </label>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={disabled}
                  onChange={(e) => setDisabled(e.target.checked)}
                  style={{ marginRight: '6px' }}
                />
                無効化状態
              </label>
            </div>
          </div>
        </div>

        {/* 右側: プレビュー */}
        <div>
          <h3>👀 プレビュー</h3>
          <div style={{ padding: '20px', border: '2px dashed #ddd', borderRadius: '8px', marginBottom: '20px' }}>
            <DatePicker
              label={label}
              value={selectedDate}
              onChange={(newValue) => {
                setSelectedDate(newValue);
                console.log('インタラクティブデモ - 選択された日付:', newValue?.format('YYYY-MM-DD'));
              }}
              minDate={convertStringToDayjs(minDate)}
              maxDate={convertStringToDayjs(maxDate)}
              allowedDaysOfWeek={allowedDays.length > 0 ? allowedDays as (0 | 1 | 2 | 3 | 4 | 5 | 6)[] : undefined}
              helperText={helperText}
              error={error}
              disabled={disabled}
              format={format}
              onBlur={(event) => {
                console.log('インタラクティブデモ - onBlur:', event.target.value);
              }}
            />
          </div>

          {/* 現在の設定値表示 */}
          <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '8px', fontSize: '12px' }}>
            <h4>📊 現在の設定値</h4>
            <div style={{ display: 'grid', gap: '4px', fontFamily: 'monospace' }}>
              <div><strong>選択された日付:</strong> {selectedDate ? selectedDate.format('YYYY-MM-DD') : '未選択'}</div>
              <div><strong>ラベル:</strong> "{label}"</div>
              <div><strong>ヘルパーテキスト:</strong> "{helperText}"</div>
              <div><strong>フォーマット:</strong> {format}</div>
              <div><strong>最小日付:</strong> {minDate || '未設定'}</div>
              <div><strong>最大日付:</strong> {maxDate || '未設定'}</div>
              <div><strong>選択可能曜日:</strong> {allowedDays.length > 0 ? `[${allowedDays.join(', ')}]` : '全日選択可能'}</div>
              <div><strong>エラー状態:</strong> {error ? 'true' : 'false'}</div>
              <div><strong>無効化状態:</strong> {disabled ? 'true' : 'false'}</div>
            </div>
          </div>

          {/* 使用方法のヒント */}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', fontSize: '12px' }}>
            <h4>💡 使用方法のヒント</h4>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>クイック設定ボタンで一般的なパターンを試せます</li>
              <li>曜日制限では複数の曜日を組み合わせて選択できます</li>
              <li>日付範囲と曜日制限は同時に適用されます</li>
              <li>F12でコンソールを開くと、onChange/onBlurイベントの詳細が確認できます</li>
              <li>エラー状態や無効化状態の見た目の変化も確認してください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AllowedDaysOfWeekDebug = () => {
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | undefined>(undefined);
  const [debugInfo, setDebugInfo] = React.useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [info, ...prev.slice(0, 9)]);
  };

  // 今日から30日間の曜日情報を表示
  const generateDateInfo = () => {
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const date = dayjs().add(i, 'day');
      dates.push({
        date: date.format('YYYY/MM/DD'),
        dayName: date.format('dddd'),
        dayValue: date.day(),
        isWeekend: [0, 6].includes(date.day()),
        isWeekday: [1, 2, 3, 4, 5].includes(date.day())
      });
    }
    return dates;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>allowedDaysOfWeek デバッグ用テスト</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h4>テスト用DatePicker（平日のみ）</h4>
          <DatePicker
            label="平日のみ選択可能"
            helperText="月〜金のみ選択できるはずです"
            allowedDaysOfWeek={[1, 2, 3, 4, 5]}
            value={selectedDate}
            onChange={(newValue) => {
              setSelectedDate(newValue);
              if (newValue) {
                const dayValue = newValue.day();
                const dayName = newValue.format('dddd');
                const isAllowed = [1, 2, 3, 4, 5].includes(dayValue);
                addDebugInfo(`選択: ${newValue.format('YYYY/MM/DD')} (${dayName}, day()=${dayValue}, 許可=${isAllowed})`);
              } else {
                addDebugInfo('日付クリア');
              }
            }}
          />

          <div style={{ marginTop: '10px', fontSize: '12px' }}>
            <strong>現在の設定:</strong> allowedDaysOfWeek=[1,2,3,4,5] (月〜金)
          </div>
        </div>

        <div>
          <h4>デバッグ情報</h4>
          <div style={{
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '10px',
            height: '150px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {debugInfo.length === 0 ? (
              <div style={{ color: '#666' }}>日付を選択するとデバッグ情報が表示されます</div>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} style={{ marginBottom: '2px' }}>
                  {info}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div>
        <h4>日付と曜日の対応表（今日から30日間）</h4>
        <div style={{
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '10px',
          fontSize: '12px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 80px 50px 60px 60px', gap: '10px', fontWeight: 'bold', marginBottom: '5px' }}>
            <div>日付</div>
            <div>曜日</div>
            <div>day()</div>
            <div>平日?</div>
            <div>週末?</div>
          </div>
          {generateDateInfo().map((dateInfo, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '120px 80px 50px 60px 60px',
              gap: '10px',
              backgroundColor: dateInfo.isWeekday ? '#e8f5e8' : '#ffe8e8',
              padding: '2px 0'
            }}>
              <div>{dateInfo.date}</div>
              <div>{dateInfo.dayName}</div>
              <div>{dateInfo.dayValue}</div>
              <div>{dateInfo.isWeekday ? 'Yes' : 'No'}</div>
              <div>{dateInfo.isWeekend ? 'Yes' : 'No'}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <strong>説明:</strong>
          <ul style={{ paddingLeft: '15px', margin: '5px 0' }}>
            <li>緑色の行: 平日（選択可能であるべき）</li>
            <li>赤色の行: 週末（選択不可であるべき）</li>
            <li>day()値: 0=日曜, 1=月曜, 2=火曜, 3=水曜, 4=木曜, 5=金曜, 6=土曜</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
