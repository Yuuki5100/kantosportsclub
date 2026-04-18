// scripts/convertCsv.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM互換の __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ファイルパス
const INPUT_CSV = path.resolve(__dirname, "../analysis/usage-matrix.csv");
const OUTPUT_CSV = path.resolve(__dirname, "../analysis/usage-matrix.grouped.csv");
const LOGICAL_MAP_PATH = path.resolve(__dirname, "../analysis/logical-map.json");

// logical-map.json 読み込み
if (!fs.existsSync(LOGICAL_MAP_PATH)) {
  console.error("❌ logical-map.json が見つかりません。先に extractNamingMapper.ts を実行してください。");
  process.exit(1);
}

const logicalMap: Record<string, string> = JSON.parse(fs.readFileSync(LOGICAL_MAP_PATH, "utf-8"));

// パス正規化（Windows対応）
const normalizePath = (p: string) => p.replace(/\\/g, "/");

// グループ名を取得（prefix一致 → 論理名 / なければ "その他"）
function resolveGroup(filePath: string): string {
  const entry = Object.entries(logicalMap).find(([prefix]) =>
    filePath.startsWith(prefix)
  );
  return entry ? entry[1] : "その他";
}

// CSV 読み込み
const lines = fs.readFileSync(INPUT_CSV, "utf-8").split("\n");
const header = lines[0].trim();
const rows = lines.slice(1).filter(line => line.trim().length > 0);

// グルーピング
const parsed = rows.map((line) => {
  const [filePath] = line.split(",");
  const group = resolveGroup(normalizePath(filePath));
  return { filePath, group, row: line };
});

// グループ・ファイル順にソート
parsed.sort((a, b) => {
  if (a.group !== b.group) return a.group.localeCompare(b.group);
  return a.filePath.localeCompare(b.filePath);
});

// 出力生成
const outputLines = [header];
let currentGroup = "";

for (const entry of parsed) {
  if (entry.group !== currentGroup) {
    currentGroup = entry.group;
    outputLines.push(""); // グループ区切り
    outputLines.push(`## ${currentGroup}`);
  }
  outputLines.push(entry.row);
}

// 書き出し
fs.writeFileSync(OUTPUT_CSV, outputLines.join("\n"), "utf-8");
console.log(`✅ グルーピング済み usage-matrix を出力しました: ${OUTPUT_CSV}`);
