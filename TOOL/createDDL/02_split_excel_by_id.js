const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excelファイルのパス
const excelPath = process.argv[2];
if (!excelPath) {
  console.error('Usage: node <script> <path_to_excel>');
  process.exit(1);
}
const workbook = xlsx.readFile(excelPath);
const sheetName = '項目一覧';
const worksheet = workbook.Sheets[sheetName];

// 対象列インデックス（0始まり）
// B=1, C=2, D=3, E=4, ..., U=20
// 対象列インデックス（0始まり）
// B=1 ～ U=20、W=22 ～ AF=31
const targetIndexes = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30, 31
];

// 全行データを2次元配列で読み込み
const allData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// 3行目（インデックス2）をヘッダーとして使用
const headers = targetIndexes.map(i => allData[2][i]);

// 3行目以降のデータをグループ化（D列インデックス3の値をキーに）
const dataGroups = {};

for (let i = 3; i < allData.length; i++) {
  const row = allData[i];

  // 「*」だけの最終行を除外
  const isStarRow = row.every(cell => {
    const value = (cell || '').toString().trim();
    return value === '' || value === '*';
  });
  if (isStarRow) continue;

  const id = row[3]; // D列
  if (id == null || id === '') continue;

  const groupKey = id.toString().trim();
  const rowData = targetIndexes.map(j => row[j] != null ? row[j] : '');

  if (!dataGroups[groupKey]) {
    dataGroups[groupKey] = [];
  }
  dataGroups[groupKey].push(rowData);
}

// CSV出力フォルダのパス（./CSV）
const outputDir = path.join(__dirname, 'CSV');

// 出力ディレクトリを作成する前に、既存ファイルをすべて削除
if (fs.existsSync(outputDir)) {
  fs.readdirSync(outputDir).forEach(file => {
    const filePath = path.join(outputDir, file);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  });
} else {
  fs.mkdirSync(outputDir);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// ファイル名に使えない文字を除去
function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim();
}

// 各グループごとにCSV出力
for (const [groupId, rows] of Object.entries(dataGroups)) {
  const secondRow = rows[0];

  // C列（インデックス1）＝日本語名、D列（インデックス2）＝番号
  const nameFromC = secondRow[1] ? secondRow[1].toString().trim() : 'UnknownName';
  const numberFromD = secondRow[2] ? secondRow[2].toString().trim() : '000';

  const safeFileName = sanitizeFilename(`${numberFromD}_${nameFromC}`);
  const filename = `${safeFileName}.csv`;
  const csvPath = path.join(outputDir, filename);

  // CSV本文：ヘッダー＋行データ
  const csvContent = [headers, ...rows].map(row =>
    row.map(cell => {
      const str = (cell != null) ? cell.toString() : '';
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');

  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`出力: CSV/${filename}`);
}
