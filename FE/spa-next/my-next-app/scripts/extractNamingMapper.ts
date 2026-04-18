// scripts/extractNamingMapper.ts
import { Project, ts } from "ts-morph";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM互換の __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ts-morphプロジェクト
const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, "../tsconfig.json"),
});

const sourceFile = project.getSourceFileOrThrow("src/config/PageConfig.tsx");

const map: Record<string, string> = {};

// オブジェクトから name / resourceKey を抽出
function extractFromObject(obj: any): void {
  const nameProp = obj.getProperty("name");
  const resourceKeyProp = obj.getProperty("resourceKey");

  const name = nameProp?.getInitializer()?.getText()?.replace(/^['"`](.*?)['"`]$/, "$1");
  const resourceKey = resourceKeyProp?.getInitializer()?.getText()?.replace(/^['"`](.*?)['"`]$/, "$1");

  if (name && resourceKey && resourceKey.startsWith("/")) {
    const topPath = resourceKey.split("/")[1] || "";
    const key = topPath ? `src/pages/${topPath}` : "src/pages";
    if (!map[key]) {
      map[key] = name;
    }
  }

  const childrenProp = obj.getProperty("children");
  const childrenArray = childrenProp?.getInitializerIfKind?.(ts.SyntaxKind.ArrayLiteralExpression);
  if (childrenArray) {
    for (const el of childrenArray.getElements()) {
      if (el.getKindName() === "ObjectLiteralExpression") {
        extractFromObject(el);
      }
    }
  }
}

// 配列を取得してループ
const configArray = sourceFile
  .getVariableDeclarationOrThrow("pageConfig")
  .getInitializerIfKindOrThrow(ts.SyntaxKind.ArrayLiteralExpression);

for (const el of configArray.getElements()) {
  if (el.getKindName() === "ObjectLiteralExpression") {
    extractFromObject(el);
  }
}

// 出力
const outputPath = path.resolve(__dirname, "../analysis/logical-map.json");
fs.writeFileSync(outputPath, JSON.stringify(map, null, 2), "utf-8");
console.log(`✅ 論理名マッピングを JSX 評価なしで出力しました: ${outputPath}`);
