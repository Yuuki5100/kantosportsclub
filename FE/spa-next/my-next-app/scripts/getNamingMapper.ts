// scripts/getNamingMapper.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PageConfigType } from "../src/config/PageConfig";
// @ts-expect-error: TS cannot handle .tsx import in this context
import { getPageConfig } from "../src/config/PageConfig.tsx"; // ✅ named export に対応

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logicalMap: Record<string, string> = {};

function extractTopLevelPath(resourceKey: string): string | null {
  if (!resourceKey || !resourceKey.startsWith("/")) return null;
  const parts = resourceKey.split("/");
  return parts.length > 1 && parts[1] ? `src/pages/${parts[1]}` : "src/pages/root";
}

function walkConfig(items: PageConfigType) {
  for (const item of items) {
    if (
      item.permissionTargetKey === "MENU_NOT_DISPLAY" || // 対応：除外キー
      !item.resourceKey
    ) {
      continue;
    }

    const topLevelPath = extractTopLevelPath(item.resourceKey);
    if (topLevelPath && !logicalMap[topLevelPath]) {
      logicalMap[topLevelPath] = item.name;
    }

    if (item.children?.length) {
      walkConfig(item.children);
    }
  }
}

// データ取得とマッピング作成
const pageConfig = getPageConfig();
walkConfig(pageConfig);

// 書き出し先
const outputPath = path.resolve(__dirname, "../analysis/logical-map.json");
fs.writeFileSync(outputPath, JSON.stringify(logicalMap, null, 2), "utf-8");
console.log(`✅ 論理名マッピングを書き出しました: ${outputPath}`);
