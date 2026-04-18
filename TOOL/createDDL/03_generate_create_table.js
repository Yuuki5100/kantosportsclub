const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const outputCsvPath = path.join(__dirname, "output.csv");
const csvDirPath = path.join(__dirname, "CSV");
const outputSqlPath = path.join(__dirname, "create_all_tables.sql");
const dropTableNames = [];
const tableMap = new Map();
const createStatements = [];
const indexStatements = [];
const foreignKeys = [];
const skippedTables = [];

function loadOutputCsv() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(outputCsvPath)
      .pipe(csv())
      .on("data", (row) => {
        const no = row["No."]?.trim();
        const tableNameEn = row["テーブル名（英字）"]?.trim();
        const tableComment = row["テーブル名（日本語）"]?.trim();
        if (no && tableNameEn) {
          tableMap.set(no, {
            tableName: tableNameEn,
            tableComment: tableComment || "",
          });
        }
      })
      .on("end", resolve)
      .on("error", reject);
  });
}

function processTableCsvFiles() {
  const files = fs.readdirSync(csvDirPath).filter((f) => f.endsWith(".csv"));

  for (const file of files) {
    const filePath = path.join(csvDirPath, file);
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) continue;

    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
    const rows = lines
      .slice(1)
      .map((line) =>
        line.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim())
      );

    const getCol = (row, name) => row[headers.indexOf(name)] || "";

    const tableNo = getCol(rows[0], "Tbl No");
    const tableDef = tableMap.get(tableNo);
    if (!tableDef) continue;

    const tableName = tableDef.tableName;
    const tableComment = tableDef.tableComment;
    // ── 各テーブル名だけを収集
    dropTableNames.push(tableName);

    if (rows.length <= 1) {
      skippedTables.push({ name: tableName, comment: tableComment });
      continue;
    }

    const columns = [];
    const pkCols = [];
    const uniqueCols = [];
    const fkDefs = [];
    const indexOrderMap = {};
    const singleIndexCols = [];

    // エクセルの項目名が変更されたらこちらも変更する
    for (const row of rows) {
      const colName = getCol(row, "項目名（英字）【開発工程で追記】");
      const colComment = getCol(row, "項目名（日本語）");
      const dbType = getCol(row, "DB型").toUpperCase();
      const intLen = getCol(row, "桁数 整数部");
      const decLen = getCol(row, "桁数 小数部");
      const defaultVal = getCol(row, "デフォルト値").trim();
      const isPK = !!getCol(row, "主キー").trim();
      const isUnique = !!getCol(row, "ユニークキー").trim();
      const isNotNull = !!getCol(row, "Not Null").trim();
      const isAuto = !!getCol(row, "自動採番").trim();
      const addIndex = !!getCol(row, "INDEX追加").trim();
      const singleIndex = !!getCol(row, "単一カラム").trim();

      const hasReferenceMark = !!getCol(row, "参照キー").trim();
      const refTable = getCol(row, "参照テーブル（英語）");
      const refColumn = getCol(row, "参照カラム（英語）");

      if (!colName) continue;

      let typeStr = dbType;
      if (["DECIMAL", "NUMERIC"].includes(dbType)) {
        const intPart = parseInt(intLen || "0", 10);
        const decPart = parseInt(decLen || "0", 10);
        if (
          !isNaN(intPart) &&
          !isNaN(decPart) &&
          (intPart > 0 || decPart > 0)
        ) {
          const totalDigits = intPart + decPart;
          typeStr += `(${totalDigits},${decPart})`;
        } else if (intLen) {
          typeStr += `(${intLen})`;
        }
      } else if (
        ["VARCHAR", "CHAR", "TINYINT", "INT", "BIGINT", "DATETIME"].includes(
          dbType
        )
      ) {
        if (intLen && intLen !== "-") {
          typeStr += `(${intLen})`;
        }
      }

      const constraints = [];
      if (isNotNull) constraints.push("NOT NULL");
      if (defaultVal !== "") {
        // 数字・関数・NULL は裸、それ以外はシングルクォート
        const needsQuote = !/^(NULL|CURRENT_TIMESTAMP|NOW\(\)|UUID\(\)|-?\d+(\.\d+)?|\d+)$/.test(defaultVal);
        const escaped    = defaultVal.replace(/'/g, "''");
        constraints.push(`DEFAULT ${needsQuote ? `'${escaped}'` : defaultVal}`);
      }
      if (isAuto) constraints.push("AUTO_INCREMENT");

      columns.push(
        `  \`${colName}\` ${typeStr} ${constraints.join(
          " "
        )} COMMENT '${colComment}'`
      );

      if (isPK) pkCols.push(`\`${colName}\``);
      if (isUnique) uniqueCols.push(`\`${colName}\``);

      if (hasReferenceMark && refTable && refColumn) {
        fkDefs.push({
          col: colName,
          refTable,
          refCol: refColumn,
        });
      }

      // 複合インデックス定義
      if (addIndex) {
        for (let i = 1; i <= 8; i++) {
          const indexStr = getCol(row, `${i}`);
          if (indexStr && !isNaN(indexStr)) {
            const priority = parseInt(indexStr, 10);
            if (!indexOrderMap[priority]) indexOrderMap[priority] = [];
            indexOrderMap[priority].push(colName);
          }
        }
      }

      // 単一カラムインデックス対象
      if (singleIndex) {
        singleIndexCols.push(colName);
      }
    }

    // CREATE TABLE文構築
    const createParts = [
      `CREATE TABLE \`${tableName}\` (`,
      columns.join(",\n"),
    ];
    if (pkCols.length)
      createParts.push(`  ,PRIMARY KEY (${pkCols.join(", ")})`);
    if (uniqueCols.length)
      createParts.push(`  ,UNIQUE (${uniqueCols.join(", ")})`);
    createParts.push(`) COMMENT='${tableComment}';\n`);
    createStatements.push(createParts.join("\n"));

    // 複合インデックスのCREATE INDEX文生成
    const orderedIndexCols = Object.keys(indexOrderMap)
      .map((n) => parseInt(n))
      .sort((a, b) => a - b)
      .flatMap((n) => indexOrderMap[n].map((col) => `\`${col}\``));

    if (orderedIndexCols.length > 0) {
      indexStatements.push(
        `CREATE INDEX idx_${tableName} ON \`${tableName}\` (${orderedIndexCols.join(
          ", "
        )});`
      );
    }

    // 単一カラムインデックスのCREATE INDEX文生成
    for (const col of singleIndexCols) {
      indexStatements.push(
        `CREATE INDEX idx_${tableName}_${col} ON \`${tableName}\` (\`${col}\`);`
      );
    }

    // 外部キー追加
    for (const fk of fkDefs) {
      foreignKeys.push(
        `ALTER TABLE \`${tableName}\` ADD FOREIGN KEY (\`${fk.col}\`) REFERENCES \`${fk.refTable}\`(\`${fk.refCol}\`);`
      );
    }
  }
}

function writeSqlFile() {
  // ── ここで１行にまとめて DROP
  const dropSql = `DROP TABLE IF EXISTS ${dropTableNames
    .map((name) => `\`${name}\``)
    .join(", ")};`;

  const fullSQL = [
    "--DROP TABLE 文をここで一括実行",
    dropSql,
    "",
    "-- 自動生成された CREATE TABLE 文",
    ...createStatements,
    "",
    "-- インデックスの追加",
    ...indexStatements,
    "",
    "-- 外部キー制約の追加",
    ...foreignKeys,
  ].join("\n");

  fs.writeFileSync(outputSqlPath, fullSQL, "utf8");
  console.log(`✅ SQLファイルを出力しました: ${outputSqlPath}`);

  if (skippedTables.length) {
    console.log(
      "\n❗以下のテーブルはカラム定義がなく、CREATE TABLE文をスキップしました:"
    );
    skippedTables.forEach((t) => {
      console.log(`- ${t.name} (${t.comment})`);
    });
  }
}

(async () => {
  try {
    await loadOutputCsv();
    processTableCsvFiles();
    writeSqlFile();
  } catch (err) {
    console.error("❌ エラー:", err);
  }
})();
