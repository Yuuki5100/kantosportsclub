import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const COMPONENTS_DIR = path.join(__dirname, "../src/components");
const TARGET_FOLDERS = ["base", "composite", "functional"];
const DRY_RUN = false; // ← true にすると dry-run モード

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function safeGitMv(oldPath: string, newPath: string) {
  if (oldPath === newPath) return;

  const tempPath = oldPath + "_temp_mv_safe";

  try {
    if (DRY_RUN) {
      console.log(`🔸 (dry run) git mv "${oldPath}" "${tempPath}"`);
      console.log(`🔸 (dry run) git mv "${tempPath}" "${newPath}"`);
    } else {
      execSync(`git mv "${oldPath}" "${tempPath}"`);
      execSync(`git mv "${tempPath}" "${newPath}"`);
      console.log(`✅ git mv "${oldPath}" → "${newPath}"`);
    }
  } catch (e) {
    console.error(`❌ git mv failed: ${oldPath} → ${newPath}`, e);
  }
}

function renameFolderIfNeeded(dirPath: string) {
  const folderName = path.basename(dirPath);
  const parentDir = path.dirname(dirPath);
  const expectedName = toPascalCase(folderName);

  const expectedPath = path.join(parentDir, expectedName);
  if (folderName !== expectedName) {
    console.warn(`⚠️ フォルダ "${folderName}" を "${expectedName}" にリネーム`);
    safeGitMv(dirPath, expectedPath);
    return expectedPath;
  }

  return dirPath;
}

function renameFilesToPascalCase(dirPath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".tsx")) {
      const baseName = entry.name.replace(/\.tsx$/, "");
      const expectedName = toPascalCase(baseName);
      if (baseName !== expectedName) {
        const oldFilePath = path.join(dirPath, `${baseName}.tsx`);
        const newFilePath = path.join(dirPath, `${expectedName}.tsx`);
        console.warn(`⚠️ ファイル "${baseName}.tsx" を "${expectedName}.tsx" にリネーム`);
        safeGitMv(oldFilePath, newFilePath);
      }
    }
  }
}

function generateIndexFileForFolder(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const fileExports: string[] = [];
  const folderExports: string[] = [];

  for (const entry of entries) {
    // const entryPath = path.join(dir, entry.name);

    if (entry.isFile() && entry.name.endsWith(".tsx") && entry.name !== "index.ts") {
      const baseName = entry.name.replace(/\.tsx$/, "");
      const pascalName = toPascalCase(baseName);
      fileExports.push(`export { default as ${pascalName} } from "./${pascalName}";`);
    }

    if (entry.isDirectory()) {
      const subDirPath = path.join(dir, entry.name);
      const renamedPath = renameFolderIfNeeded(subDirPath); // フォルダ名リネーム

      const indexPath = path.join(renamedPath, "index.ts");
      if (fs.existsSync(indexPath)) {
        folderExports.push(`export * from "./${path.basename(renamedPath)}";`);
      }

      // サブディレクトリ内のファイル名リネーム
      renameFilesToPascalCase(renamedPath);
    }
  }

  const allExports = [...folderExports, ...fileExports].sort();
  const indexPath = path.join(dir, "index.ts");
  fs.writeFileSync(indexPath, allExports.join("\n") + "\n", "utf8");
  console.log(`✅ ${path.relative(process.cwd(), indexPath)} を生成しました`);
}

function main() {
  for (const folder of TARGET_FOLDERS) {
    const rootPath = path.join(COMPONENTS_DIR, folder);

    if (!fs.existsSync(rootPath)) {
      console.warn(`⚠️ ${rootPath} は存在しません。スキップします。`);
      continue;
    }

    generateIndexFileForFolder(rootPath);

    const entries = fs.readdirSync(rootPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subPath = path.join(rootPath, entry.name);
        generateIndexFileForFolder(subPath);
      }
    }
  }
}

main();
