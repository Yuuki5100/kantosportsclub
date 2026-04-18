const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excelファイルのパス
const excelPath = process.argv[2];
if (!excelPath) {
  console.error('Usage: node <script> <path_to_excel>');
  process.exit(1);
}

// 読み込みとシート取得
const workbook = xlsx.readFile(excelPath);
const sheetName = 'テーブル一覧';
const worksheet = workbook.Sheets[sheetName];

// 全行データを読み込み
let allData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// A～D列に限定、空行除外
let filteredData = allData
  .map(row => row.slice(0, 4))
  .filter(row => row.length > 0);

// 指定の文言が最後の行であれば削除
const exclusionText = "※これより上に行挿入にて増やすこと（別シートで関数参照しているため）";
const lastRow = filteredData[filteredData.length - 1];
const lastRowText = lastRow.join('').trim();
if (lastRowText === exclusionText) {
  filteredData.pop();
}


// CSVに変換
const csvOutput = filteredData.map(row =>
  row.map(item => (item != null ? `"${item.toString().replace(/"/g, '""')}"` : '')).join(',')
).join('\n');

// 書き出し
const csvPath = path.join(__dirname, 'output.csv');
fs.writeFileSync(csvPath, csvOutput, 'utf8');

console.log(`CSVファイルを出力しました: ${csvPath}`);
