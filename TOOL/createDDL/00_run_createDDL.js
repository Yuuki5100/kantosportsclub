// run_all.js
const path = require("path");
const { spawnSync } = require("child_process");

//
// 設計書のファイル名を記載
//
const excelFile = path.join(
    __dirname,
    "UI07_テーブルファイル定義書 （100_入出庫予約管理）.v2 (1).xlsx");

function runScript(scriptName, args = []) {
    console.log(`\n▶︎ ${scriptName} を実行…`);
    const proc = spawnSync("node", [path.join(__dirname, scriptName), ...args], {
        stdio: "inherit",
    });
    if (proc.error) {
        console.error(`✖ ${scriptName} 実行中にエラー:`, proc.error);
        process.exit(1);
    }
    if (proc.status !== 0) {
        console.error(`✖ ${scriptName} がステータス ${proc.status} で終了しました`);
        process.exit(proc.status);
    }
}

try {
    // テーブル一覧作成
    runScript("01_excel_to_csv.js", [excelFile]);

    // テーブル項目CSV作成
    runScript("02_split_excel_by_id.js", [excelFile]);

    // DDL作成
    runScript("03_generate_create_table.js");

    console.log("\n✅ すべての処理が正常に完了しました！");
} catch (err) {
    console.error("\n✖ 何らかの例外が発生しました:", err);
    process.exit(1);
}
