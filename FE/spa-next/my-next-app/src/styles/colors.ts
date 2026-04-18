// src/styles/colors.ts

const colors = {
  tableHeaderColor: '#111111',   // テーブルヘッダー文字色（RGB: 17, 17, 17）
  tableRowHover: '#f5f5f5',      // テーブル行ホバー背景色（RGB: 245, 245, 245）
  tableBorder: '#dddddd',        // テーブル罫線色（RGB: 221, 221, 221）

  inputText: '#333333',          // 入力文字色（RGB: 51, 51, 51）
  inputDisabledBg: '#f0f0f0',    // 入力コンポーネント無効時の背景色（RGB: 240, 240, 240）
  inputErrorBorder: '#ff3333',   // 入力エラー時の枠線色（RGB: 255, 51, 51）

  primary: '#1976d2',            // プライマリカラー（ボタン/リンクなどの基本色、RGB: 25, 118, 210）
  secondary: '#9c27b0',          // セカンダリカラー（補助色、RGB: 156, 39, 176）

  grayLight: '#eeeeee',          // 薄いグレー（背景・枠用、RGB: 238, 238, 238）
  grayMiddeDark: '#AEAEAE',      // 中間グレー（無効状態など、RGB: 174, 174),
  grayDark: '#666666',           // 濃いグレー（強調テキストなど、RGB: 102, 102, 102）
  textMuted: '#888888',          // サブテキスト用カラー（RGB: 136, 136, 136）

  // --- brand palette ---
  LightGreen: '#B5DBB8',      // ヘッダー背景色（RGB: 181, 219, 184）
  Green: '#1D9F64',           // ボタン用カラー（RGB: 29, 159, 100）
  Blue: '#0C3484',            // 通知/フォーカス枠/ラジオON/トグルON/予約枠「〇」（RGB: 12, 52, 132）
  LightBlue: '#83cceb',       // 補助的な水色（RGB: 131, 204, 235）
  Black: '#06172F',           // フォント用の濃紺ブラック（RGB: 6, 23, 47）
  Red: '#FC3838',             // 必須ラベル・エラーメッセージ（RGB: 252, 56, 56）
  Yellow: '#ffff88',          // 注意喚起・警告背景色（RGB: 255, 255, 136）
  nonActiveGray: '#ecececff',      // 非活性ボタン・入力欄（RGB: 227, 218, 218）
  nonActiveGrayBorder: '#BDBDBD',// 非活性時の外枠色（RGB: 0, 0, 0.26）

  commonTableHeader: '#f5f5f5',     // テーブルヘッダー背景色（RGB: 241, 245, 249）
  commonTableCellBgColor: '#146585',// テーブルセル背景色（アクセントカラー、RGB: 20, 101, 133）
  commonTableHover: '#f5f5f5',      // テーブル行ホバー背景色（RGB: 248, 250, 252）
  commonFontColorWhite: '#ffffff',  // フォントカラー（白、RGB: 255, 255, 255）
  commonFontColorBlack: '#000000',  // フォントカラー（黒、RGB: 0, 0, 0）
  commonBorderGray: '#dde2e7ff',      // 枠線用グレー（RGB: 226, 232, 240）
} as const;

export default colors;
