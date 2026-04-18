// scripts/generate-page.ts

import fs from "fs";
import path from "path";
import prettier from "prettier";

// 🔹 引数チェック
const args = process.argv.slice(2);
const rawPageName = args[0];

if (!rawPageName) {
  console.error("❌ ページ名を指定してください。例: npm run generate-page user");
  process.exit(1);
}

const pageName = rawPageName.toLowerCase();
const PageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

// 🔹 各種パス
const pagesDir = path.join(__dirname, "../src/pages", pageName);
const pageFile = path.join(pagesDir, `${PageName}.tsx`);
const indexFile = path.join(pagesDir, `index.ts`);
const langFile = path.join(__dirname, `../src/lang/${pageName}.lang.ts`);
const configFile = path.join(__dirname, "../src/config/pageConfig.tsx");

// 🔹 テンプレート
const pageTemplate = `import React from "react";
import Box from "@/components/base/Box";
import { useLanguage } from "@/hooks/useLanguage";
import lang from "@lang/${pageName}.lang";

const ${PageName}Page: React.FC = () => {
  const l = useLanguage(lang);

  return (
    <Box>
      <h1>{l.title}</h1>
      <p>{l.description}</p>
    </Box>
  );
};

export default ${PageName}Page;
`;

const langTemplate = `export default {
  ja: {
    title: "${PageName}ページ",
    description: "${PageName}の説明",
  },
  en: {
    title: "${PageName} Page",
    description: "Description of ${PageName} page.",
  },
};
`;

const indexTemplate = `export { default } from "./${PageName}";
`;

// 🔹 pageConfig.ts に追記
async function appendPageConfig() {
  const configCode = fs.readFileSync(configFile, "utf8");
  const insertLine = `  "/${pageName}": { name: "${PageName}ページ", resourceKey: "${pageName}", requiredPermission: 0 },\n`;
  const updated = configCode.replace(
    /(const pageConfig: PageConfigType = {\n)/,
    `$1${insertLine}`
  );
  const formatted = await prettier.format(updated, { parser: "typescript" });
  fs.writeFileSync(configFile, formatted);
}

// 🔹 ディレクトリとファイル生成
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}
fs.writeFileSync(pageFile, pageTemplate);
fs.writeFileSync(indexFile, indexTemplate);
fs.writeFileSync(langFile, langTemplate);
appendPageConfig();

console.log(`✅ ページ "${PageName}" を作成しました！`);
