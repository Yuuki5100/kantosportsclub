import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

// coverage-summary.json のパスを相対パスで取得
const summaryJson = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json','utf-8'));

// Excel ワークブック作成
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('カバレッジ集計');

// ✅ 日本語ヘッダー行
worksheet.addRow(['ファイル名', 'ステートメント（%）', '分岐（%）', '関数（%）', '行数（%）']);

// 各ファイルのカバレッジ情報を行として追加
for (const [file, metrics] of Object.entries(summaryJson)) {
  if (file === 'total') continue; // 合計行を除外したい場合はスキップ

  worksheet.addRow([
    file,
    `${metrics.statements.pct}%`,
    `${metrics.branches.pct}%`,
    `${metrics.functions.pct}%`,
    `${metrics.lines.pct}%`
  ]);
}

// Excel ファイル出力
const outputPath = path.resolve('./coverage-summary.xlsx');
workbook.xlsx.writeFile(outputPath)
  .then(() => {
    console.log(`✅ Excel 出力完了: ${outputPath}`);
  })
  .catch(err => {
    console.error('❌ Excel 出力失敗:', err);
  });
