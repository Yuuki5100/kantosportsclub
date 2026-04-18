// 実行コマンド: node --loader ts-node/esm scripts/list-base-modules.ts

import fs from "fs";
import path from "path";

// 対象となる基盤ディレクトリ群
const BASE_DIRS = [
  "src/hooks",
  "src/utils",
  "src/api",
  "src/components/base",
  "src/components/composite",
  "src/components/CRJ",
  "src/components/functional",
  "src/slices",
  "src/types",
  "src/config",
  "src/lang",
  "src/const",
];

// 除外ファイルの正規表現（test, stories, __tests__ ディレクトリなど）
const EXCLUDE_PATTERN = /\.(test|stories|spec)\.(ts|tsx)$|__tests__/;

// analysis ディレクトリのパス
const ANALYSIS_DIR = path.resolve("analysis");

// analysis ディレクトリが存在しなければ作成
if (!fs.existsSync(ANALYSIS_DIR)) {
  fs.mkdirSync(ANALYSIS_DIR);
}

function listFiles(dirPath: string, result: string[] = []): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!/__tests__/.test(entry.name)) {
        listFiles(fullPath, result);
      }
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !EXCLUDE_PATTERN.test(fullPath)
    ) {
      const relativePath = fullPath
        .replace(/^.*[\\/]src[\\/]/, "@/") // Windows/Linux 両対応
        .replace(/\\/g, "/");
      result.push(relativePath);
    }
  }

  return result;
}

// 全ディレクトリを走査してファイル一覧を取得
const allFiles = BASE_DIRS.flatMap((dir) => listFiles(path.resolve(dir)));

// 結果を analysis/base-modules.json に保存
const outputPath = path.join(ANALYSIS_DIR, "base-modules.json");
fs.writeFileSync(outputPath, JSON.stringify(allFiles, null, 2));
console.log("✅ analysis/base-modules.json に基盤モジュール一覧を出力しました。");
