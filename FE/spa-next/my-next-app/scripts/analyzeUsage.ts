// 実行コマンド: node --loader ts-node/esm scripts/analyzeUsage.ts

import { Project } from "ts-morph";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname / __filename 再現 (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// analysis ディレクトリ作成（なければ）
const analysisDir = path.resolve(__dirname, "../analysis");
if (!fs.existsSync(analysisDir)) {
  fs.mkdirSync(analysisDir);
}

// パスを正規化する関数
const normalize = (p: string) =>
  p
    .replace(/^@\/?/, "")              // "@/hooks/useAuth" → "hooks/useAuth"
    .replace(/^src\//, "")             // "src/hooks/useAuth.ts" → "hooks/useAuth"
    .replace(/\.(ts|tsx)$/, "")        // 拡張子削除
    .replace(/\\/g, "/");              // Windows対応

// 基盤モジュール一覧の読み込み
const BASE_MODULES_PATH = path.resolve(__dirname, "../analysis/base-modules.json");
const baseModules: string[] = JSON.parse(fs.readFileSync(BASE_MODULES_PATH, "utf-8"));

// ❗ここでフルパス（@付き）を取得して保持
const targets = baseModules.map((modPath) => ({
  path: modPath,
  name: path.basename(modPath),
  full: modPath.replace(/^src\//, "@/"), // 例: src/hooks/useApi.ts → @/hooks/useApi.ts
}));

// tsconfig に従ってプロジェクトを読み込む
const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, "../tsconfig.json"),
});

// 結果格納オブジェクト
const result: Record<string, Record<string, boolean>> = {};

// 解析対象ファイル（stories/test系除外）
const files = project.getSourceFiles([
  "src/pages/**/*.ts",
  "src/pages/**/*.tsx",
  "src/components/**/*.ts",
  "src/components/**/*.tsx",
]);

for (const file of files) {
  const filePath = file.getFilePath();

  if (
    /__tests__/.test(filePath) ||
    /\.test\.(ts|tsx)$/.test(filePath) ||
    /\.stories\.(ts|tsx)$/.test(filePath)
  ) {
    continue;
  }

  const relativePath = path
    .relative(path.resolve(__dirname, ".."), filePath)
    .replace(/\\/g, "/");

  result[relativePath] = {};

  const importPaths = file.getImportDeclarations().map((imp) =>
    normalize(imp.getModuleSpecifierValue())
  );

  for (const target of targets) {
    const normalizedTarget = normalize(target.path);
    result[relativePath][target.full] = importPaths.some((imp) =>
      imp.endsWith(normalizedTarget)
    );
  }
}

// ✅ CSV出力（ヘッダーにフルパスを使用）
const header = ["File", ...targets.map(t => t.full)];
const rows = Object.entries(result).map(([file, usage]) => {
  const row = [file];
  for (const t of targets) {
    row.push(usage[t.full] ? "✅" : "❌");
  }
  return row.join(",");
});

const csvOutput = [header.join(","), ...rows].join("\n");
fs.writeFileSync(path.join(analysisDir, "usage-matrix.csv"), csvOutput);
console.log("✅ analysis/usage-matrix.csv を出力しました。");

// 使用されていない基盤モジュール一覧出力
const unusedModules = targets.filter((target) => {
  return Object.values(result).every((usageMap) => !usageMap[target.full]);
});

if (unusedModules.length > 0) {
  const unusedList = unusedModules.map((t) => t.full).join("\n");
  fs.writeFileSync(path.join(analysisDir, "unused-base-modules.txt"), unusedList);
  console.log(`⚠️ 未使用モジュール ${unusedModules.length} 件を analysis/unused-base-modules.txt に出力しました。`);
} else {
  console.log("🎉 すべての基盤モジュールが使用されています。");
}
