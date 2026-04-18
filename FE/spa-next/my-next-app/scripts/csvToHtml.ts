// 実行コマンド: node --loader ts-node/esm scripts/csvToHtml.ts

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const analysisDir = path.resolve(__dirname, "../analysis");
const csvPath = path.join(analysisDir, "usage-matrix.grouped.csv");
const htmlPath = path.join(analysisDir, "usage-matrix.html");

if (!fs.existsSync(csvPath)) {
  console.error("❌ usage-matrix.grouped.csv が見つかりません。先に analyzeUsage.ts を実行してください。");
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, "utf-8");
const [headerLine, ...lines] = csvContent.trim().split("\n");
const headers = headerLine.split(",");
const dataRows = lines.map((line) => line.split(","));

// 未使用列検出
const unusedCols = headers.slice(1).map((_, i) =>
  dataRows.every((row) => row[i + 1] === "❌")
);

// グループ分類ルール
function getGroup(name: string): string {
  name = name.trim();
  if (/^@\/components\/base(\/|$)/.test(name)) return "base";
  if (/^@\/components\/composite(\/|$)/.test(name)) return "composite";
  if (/^@\/components\/CRJ(\/|$)/.test(name)) return "CRJ";
  if (/^@\/components\/functional(\/|$)/.test(name)) return "functional";
  if (/^@\/hooks(\/|$)/.test(name)) return "hooks";
  if (/^@\/utils(\/|$)/.test(name)) return "utils";
  if (/^@\/api\/services\/v1\/crj(\/|$)/.test(name)) return "api-crj";
  if (/^@\/api\/services\/v1(\/|$)/.test(name)) return "api-v1";
  if (/^@\/api(\/|$)/.test(name)) return "api";
  if (/^@\/types(\/|$)/.test(name)) return "types";
  return "other";
}

// グループ分け（フィルター用）
const groups: Record<string, { name: string; colIndex: number; unused: boolean }[]> = {};
headers.slice(1).forEach((name, i) => {
  const group = getGroup(name);
  groups[group] ??= [];
  groups[group].push({ name, colIndex: i + 1, unused: unusedCols[i] });
});

// ヘッダーHTML
const htmlHeader = headers.map((h, i) => {
  const align = i === 0 ? "left" : "center";
  const isUnused = i > 0 && unusedCols[i - 1];
  const warn = isUnused ? ' <span class="danger">⚠</span>' : "";
  const unusedAttr = isUnused ? ' data-unused="true"' : "";
  return `<th data-col="${i}"${unusedAttr} style="text-align:${align};">${h}${warn}</th>`;
}).join("");

// ボディHTML（セクショングループ対応）
let htmlRows = "";
let currentTbody: string[] = [];

for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
  const row = dataRows[rowIndex];
  const firstCell = row[0].trim();
  const isSectionHeader = /^##/.test(firstCell);

  if (isSectionHeader) {
    // flush current <tbody> if not empty
    if (currentTbody.length > 0) {
      htmlRows += `<tbody>${currentTbody.join("\n")}</tbody>\n`;
      currentTbody = [];
    }

    const label = firstCell.replace(/^##\s*/, "").trim();
    const colspan = headers.length;
    currentTbody.push(`<tr class="section-row"><td colspan="${colspan}" style="background:#ddd; font-weight:bold;">${label}</td></tr>`);
  } else {
    const htmlRow = `<tr data-row="${rowIndex}">` + row.map((cell, i) => {
      const align = i === 0 ? "left" : "center";
      const isUnused = i > 0 && unusedCols[i - 1];
      const unusedAttr = isUnused ? ' data-unused="true"' : "";
      return `<td data-col="${i}"${unusedAttr} style="text-align:${align};">${cell}</td>`;
    }).join("") + "</tr>";
    currentTbody.push(htmlRow);
  }
}
if (currentTbody.length > 0) {
  htmlRows += `<tbody>${currentTbody.join("\n")}</tbody>\n`;
}

// フィルター生成
const filterControls = Object.entries(groups).map(([group, modules]) => {
  const items = modules.map((m) => {
    const warn = m.unused ? ' <span class="danger">⚠</span>' : "";
    return `<li><label><input type="checkbox" data-col="${m.colIndex}" data-group="${group}" checked> ${m.name}${warn}</label></li>`;
  }).join("");
  return `
    <details>
      <summary>
        ${group}
        <label style="margin-left: 1rem; font-weight: normal;">
          <input type="checkbox" class="group-toggle" data-group="${group}" checked> 全選択
        </label>
      </summary>
      <ul>${items}</ul>
    </details>
  `;
}).join("");

const unusedFilterControl = `
  <label style="margin-right: 1rem;">
    <input type="checkbox" id="toggleUnused" checked> 未使用モジュールを除外しない
  </label>
`;

const highlightColFilter = `
  <label style="margin-right: 1rem;">
    <input type="checkbox" id="highlightedColsOnly"> ハイライトに使われている列のみ表示（横変更）
  </label>
`;

const highlightRowFilter = `
  <label style="margin-right: 1rem;">
    <input type="checkbox" id="highlightedRowsOnly"> ハイライトされた行のみ表示（縦変更）
  </label>
`;

// スクリプト
const script = `
<script>
document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('#filter input[type=checkbox][data-col]');
  const groupToggles = document.querySelectorAll('.group-toggle');
  const matrixTable = document.getElementById('matrixTable');
  const matrixRows = matrixTable.querySelectorAll('tbody tr');
  const matrixHeaders = matrixTable.querySelectorAll('thead th');
  const colCount = matrixHeaders.length;

  const highlightedRows = new Set();
  const highlightedCols = new Set();

  function updateVisibility() {
    const showHighlightedOnly = document.getElementById('highlightedColsOnly').checked;
    const showHighlightedRowsOnly = document.getElementById('highlightedRowsOnly').checked;

    const activeCols = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.dataset.col));

    for (let i = 1; i < colCount; i++) {
      const colVisible =
        (!showHighlightedOnly && activeCols.includes(i)) ||
        (showHighlightedOnly && highlightedCols.has(i));
      matrixHeaders[i].style.display = colVisible ? '' : 'none';
      matrixRows.forEach(row => {
        row.children[i].style.display = colVisible ? '' : 'none';
      });
    }

    matrixRows.forEach(row => {
      const isHighlighted = row.classList.contains('highlight-row');
      row.style.display = showHighlightedRowsOnly && !isHighlighted ? 'none' : '';
    });
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateVisibility));

  document.getElementById('selectAll').addEventListener('click', () => {
    checkboxes.forEach(cb => cb.checked = true);
    groupToggles.forEach(gt => gt.checked = true);
    updateVisibility();
  });

  document.getElementById('clearAll').addEventListener('click', () => {
    checkboxes.forEach(cb => cb.checked = false);
    groupToggles.forEach(gt => gt.checked = false);
    updateVisibility();
  });

  groupToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const group = toggle.dataset.group;
      const inGroup = document.querySelectorAll(\`#filter input[data-group="\${group}"][data-col]\`);
      inGroup.forEach(cb => cb.checked = toggle.checked);
      updateVisibility();
    });
  });

  document.getElementById("toggleUnused").addEventListener("change", (e) => {
    const hide = !e.target.checked;
    const ths = document.querySelectorAll('#matrixTable th[data-unused="true"]');
    const tds = document.querySelectorAll('#matrixTable td[data-unused="true"]');
    [...ths, ...tds].forEach(el => {
      el.style.display = hide ? "none" : "";
    });
  });

  document.querySelectorAll('#matrixTable td[data-col="0"]').forEach(td => {
    td.addEventListener('click', () => {
      const tr = td.parentElement;
      tr.classList.toggle('highlight-row');
      const rowIndex = parseInt(tr.dataset.row);
      if (tr.classList.contains('highlight-row')) {
        highlightedRows.add(rowIndex);
        [...tr.children].forEach((cell, i) => {
          if (cell.textContent === '✅') highlightedCols.add(i);
        });
      } else {
        highlightedRows.delete(rowIndex);
        highlightedCols.clear();
        document.querySelectorAll('.highlight-row').forEach(r => {
          [...r.children].forEach((cell, i) => {
            if (cell.textContent === '✅') highlightedCols.add(i);
          });
        });
      }
      updateVisibility();
    });
  });

  document.getElementById('highlightedColsOnly').addEventListener('change', updateVisibility);
  document.getElementById('highlightedRowsOnly').addEventListener('change', updateVisibility);

  updateVisibility();
});
</script>
`;

// HTML出力
const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>基盤モジュール使用マトリクス</title>
  <style>
    body { font-family: sans-serif; padding: 2rem; }
    .danger { color: red; font-weight: bold; }
    ul { list-style: none; padding-left: 0; columns: 2; }
    details summary { cursor: pointer; font-weight: bold; margin: 0.5rem 0; }
    .table-wrapper { overflow-x: auto; max-width: 100%; }
    table { border-collapse: collapse; font-size: 13px; table-layout: auto; }
    th, td { border: 1px solid #ccc; padding: 4px 8px; min-width: 80px; white-space: nowrap; }
    th { background: #f5f5f5; position: sticky; top: 0; z-index: 2; }
    td:first-child, th:first-child { position: sticky; left: 0; background: #f5f5f5; z-index: 3; }
    tr:nth-child(even) { background-color: #fafafa; }
    td:first-child { font-family: monospace; cursor: pointer; }
    .controls { margin-bottom: 1rem; }
    summary label { font-weight: normal; font-size: 0.9em; }
    .highlight-row td { background-color: #fff2b6 !important; }
    .section-row td { background-color: #ddd !important; font-weight: bold; }
  </style>
</head>
<body>
  <h2>基盤モジュール使用マトリクス</h2>
  <div class="controls">
    <details open>
      <summary>フィルター</summary>
      <div id="filter">
        ${unusedFilterControl}
        ${highlightColFilter}
        ${highlightRowFilter}
        <button id="selectAll">すべて選択</button>
        <button id="clearAll">すべて解除</button>
        ${filterControls}
      </div>
    </details>
  </div>
  <div class="table-wrapper">
    <table id="matrixTable">
      <thead><tr>${htmlHeader}</tr></thead>
      ${htmlRows}
    </table>
  </div>
  ${script}
</body>
</html>`;

fs.writeFileSync(htmlPath, html);
console.log("✅ analysis/usage-matrix.html を出力しました。");
