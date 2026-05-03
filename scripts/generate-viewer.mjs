import { mkdir, readFile, writeFile } from "node:fs/promises";

const coreSource = await readFile(new URL("../src/core.mjs", import.meta.url), "utf8");
const browserCore = coreSource.replace(/^export /gm, "");

const viewerSource = `${browserCore}

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const DEFAULT_COLUMN_WIDTH = 180;
const MIN_COLUMN_WIDTH = 80;
const MAX_COLUMN_WIDTH = 900;
let currentBaseConfig = null;
let currentBaseName = "Base";
let currentBasePath = "";
let activeColumnResize = null;
let currentSort = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

async function syscall(name, ...args) {
  if (!window.silverbullet?.syscall) {
    throw new Error("SilverBullet document editor syscall bridge is unavailable.");
  }
  return await window.silverbullet.syscall(name, ...args);
}

async function readFileText(name) {
  const data = await syscall("space.readFile", name);
  if (typeof data === "string") {
    return data;
  }
  return decoder.decode(data);
}

async function writeFileText(name, text) {
  await syscall("space.writeFile", name, encoder.encode(text));
}

async function fileExists(name) {
  return await syscall("space.fileExists", name);
}

async function loadMarkdownRows() {
  const files = await syscall("space.listFiles");
  const markdownFiles = files.filter((file) => {
    const name = file.name ?? file.path ?? "";
    return name.endsWith(".md");
  });

  const rows = [];
  for (const file of markdownFiles) {
    const name = file.name ?? file.path;
    try {
      rows.push(makeRowFromFile(file, await readFileText(name)));
    } catch (error) {
      console.warn("Failed to read markdown file", name, error);
    }
  }
  return rows;
}

function renderModel(model, baseName) {
  const displayModel = applyCurrentSort(model);
  const warningHtml = model.warnings.length
    ? '<div class="warnings">' + model.warnings.map(escapeHtml).join("<br>") + "</div>"
    : "";
  const storedWidths = readStoredColumnWidths(baseName);
  const columnWidths = displayModel.columns.map((column) => {
    return clampColumnWidth(storedWidths[column.property] ?? column.width ?? DEFAULT_COLUMN_WIDTH);
  });
  const colgroupHtml = columnWidths.map((width, columnIndex) => {
    return '<col data-column-index="' + columnIndex + '" style="width: ' + width + 'px">';
  }).join("");
  const headerHtml = displayModel.columns.map((column, columnIndex) => {
    const label = escapeHtml(column.label);
    const direction = currentSort?.property === column.property ? currentSort.direction : null;
    const sortText = direction === "ascending" ? " &uarr;" : direction === "descending" ? " &darr;" : "";
    const ariaSort = direction ?? "none";
    return '<th data-column-index="' + columnIndex + '" aria-sort="' + ariaSort + '">' +
      '<div class="column-header"><button class="column-sort" type="button" data-column-index="' + columnIndex +
      '" title="Sort by ' + label + '">' +
      '<span class="column-label">' + label + '</span><span class="sort-indicator" aria-hidden="true">' + sortText + '</span></button>' +
      '<button class="column-resizer" type="button" data-column-index="' + columnIndex +
      '" aria-label="Resize ' + label + ' column" title="Resize column"></button></div></th>';
  }).join("");
  const rowHtml = displayModel.rows.map((row, rowIndex) => (
    '<tr>' + row.cells.map((cell, columnIndex) => {
      const column = displayModel.columns[columnIndex];
      if (column.property === "file.name") {
        return '<td><a class="page-link" href="#" data-page-path="' + escapeHtml(row.file.file.path) +
          '">' + escapeHtml(cell) + '</a></td>';
      }
      if (!column.editable) {
        return '<td>' + escapeHtml(cell) + '</td>';
      }
      return '<td contenteditable="true" spellcheck="false" data-row-index="' + rowIndex +
        '" data-column-index="' + columnIndex + '">' + escapeHtml(cell) + '</td>';
    }).join("") + '</tr>'
  )).join("");

  document.body.innerHTML = '<main>' +
    '<header><h1>' + escapeHtml(baseName) + '</h1><div class="header-actions">' +
    '<button id="add-entry" type="button">Add entry</button><span id="status">' + model.rows.length +
    ' rows</span></div></header>' +
    warningHtml +
    '<div class="table-wrap"><table style="--table-width: ' + sum(columnWidths) + 'px"><colgroup>' +
    colgroupHtml + '</colgroup><thead><tr>' + headerHtml + '</tr></thead><tbody>' + rowHtml + '</tbody></table></div>' +
    '</main>';
  document.getElementById("add-entry")?.addEventListener("click", addEntry);
  document.querySelector("tbody")?.addEventListener("focusin", rememberCellValue);
  document.querySelector("tbody")?.addEventListener("focusout", saveEditedCell);
  document.querySelector("tbody")?.addEventListener("keydown", handleCellKeydown);
  document.querySelector("tbody")?.addEventListener("click", openLinkedPage);
  document.querySelector("thead")?.addEventListener("pointerdown", beginColumnResize);
  document.querySelector("thead")?.addEventListener("keydown", handleColumnResizeKeydown);
  document.querySelector("thead")?.addEventListener("click", changeColumnSort);
  window.currentModel = displayModel;
  window.baseModel = model;
}

function applyCurrentSort(model) {
  if (!currentSort) {
    return model;
  }
  const columnIndex = model.columns.findIndex((column) => column.property === currentSort.property);
  if (columnIndex === -1) {
    currentSort = null;
    return model;
  }
  return {
    ...model,
    rows: sortTableRows(model.rows, columnIndex, currentSort.direction),
  };
}

function changeColumnSort(event) {
  const button = event.target.closest?.(".column-sort");
  if (!button) {
    return;
  }
  const model = window.baseModel;
  const column = model?.columns[Number(button.dataset.columnIndex)];
  if (!column) {
    return;
  }

  if (currentSort?.property !== column.property) {
    currentSort = { property: column.property, direction: "ascending" };
  } else if (currentSort.direction === "ascending") {
    currentSort = { property: column.property, direction: "descending" };
  } else {
    currentSort = null;
  }
  renderModel(model, currentBaseName);
}

async function addEntry() {
  if (!currentBaseConfig) {
    return;
  }

  const title = window.prompt("Entry name");
  if (title == null) {
    return;
  }

  try {
    setStatus("Adding...");
    const draft = await uniqueEntryDraft(currentBaseConfig, currentBasePath, title);
    await writeFileText(draft.path, draft.markdown);
    const rows = await loadMarkdownRows();
    renderModel(buildTableModel(currentBaseConfig, rows), currentBaseName);
  } catch (error) {
    setStatus("Add failed");
    console.error(error);
  }
}

async function uniqueEntryDraft(baseConfig, basePath, title) {
  const draft = buildNewEntryDraft(baseConfig, basePath, title);
  if (!await fileExists(draft.path)) {
    return draft;
  }

  const stem = draft.path.toLowerCase().endsWith(".md") ? draft.path.slice(0, -3) : draft.path;
  for (let index = 2; index < 1000; index++) {
    const path = stem + " (" + index + ").md";
    if (!await fileExists(path)) {
      return { ...draft, path };
    }
  }
  throw new Error("Could not find an available entry name.");
}

async function openLinkedPage(event) {
  const link = event.target.closest?.(".page-link");
  if (!link) {
    return;
  }
  event.preventDefault();
  try {
    await syscall("editor.navigate", { path: link.dataset.pagePath });
  } catch (error) {
    setStatus("Open failed");
    console.error(error);
  }
}

function beginColumnResize(event) {
  const handle = event.target.closest?.(".column-resizer");
  if (!handle) {
    return;
  }

  const columnIndex = Number(handle.dataset.columnIndex);
  const column = document.querySelector('col[data-column-index="' + columnIndex + '"]');
  if (!column) {
    return;
  }

  event.preventDefault();
  handle.classList.add("active");
  document.body.classList.add("resizing-column");
  activeColumnResize = {
    columnIndex,
    handle,
    pointerId: event.pointerId,
    startWidth: column.getBoundingClientRect().width,
    startX: event.clientX,
  };
  handle.setPointerCapture?.(event.pointerId);
  window.addEventListener("pointermove", updateColumnResize);
  window.addEventListener("pointerup", finishColumnResize, { once: true });
  window.addEventListener("pointercancel", finishColumnResize, { once: true });
}

function updateColumnResize(event) {
  if (!activeColumnResize) {
    return;
  }
  setColumnWidth(
    activeColumnResize.columnIndex,
    activeColumnResize.startWidth + event.clientX - activeColumnResize.startX,
  );
}

function finishColumnResize() {
  if (!activeColumnResize) {
    return;
  }
  persistColumnWidths();
  activeColumnResize.handle.classList.remove("active");
  activeColumnResize.handle.releasePointerCapture?.(activeColumnResize.pointerId);
  document.body.classList.remove("resizing-column");
  window.removeEventListener("pointermove", updateColumnResize);
  window.removeEventListener("pointerup", finishColumnResize);
  window.removeEventListener("pointercancel", finishColumnResize);
  activeColumnResize = null;
}

function handleColumnResizeKeydown(event) {
  const handle = event.target.closest?.(".column-resizer");
  if (!handle || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) {
    return;
  }
  event.preventDefault();
  const columnIndex = Number(handle.dataset.columnIndex);
  const currentWidth = currentColumnWidths()[columnIndex] ?? DEFAULT_COLUMN_WIDTH;
  setColumnWidth(columnIndex, currentWidth + (event.key === "ArrowRight" ? 16 : -16));
  persistColumnWidths();
}

function setColumnWidth(columnIndex, width) {
  const nextWidth = clampColumnWidth(width);
  const column = document.querySelector('col[data-column-index="' + columnIndex + '"]');
  if (!column) {
    return;
  }
  column.style.width = nextWidth + "px";
  if (window.currentModel?.columns[columnIndex]) {
    window.currentModel.columns[columnIndex].width = nextWidth;
  }
  updateTableWidth();
}

function updateTableWidth() {
  const table = document.querySelector("table");
  if (table) {
    table.style.setProperty("--table-width", sum(currentColumnWidths()) + "px");
  }
}

function currentColumnWidths() {
  return [...document.querySelectorAll("col[data-column-index]")].map((column) => {
    return clampColumnWidth(parseFloat(column.style.width) || column.getBoundingClientRect().width);
  });
}

function persistColumnWidths() {
  const widths = {};
  currentColumnWidths().forEach((width, columnIndex) => {
    const property = window.currentModel?.columns[columnIndex]?.property;
    if (property) {
      widths[property] = width;
    }
  });
  try {
    window.localStorage?.setItem(columnWidthsStorageKey(currentBaseName), JSON.stringify(widths));
  } catch (error) {
    console.warn("Failed to store column widths", error);
  }
}

function readStoredColumnWidths(baseName) {
  try {
    return JSON.parse(window.localStorage?.getItem(columnWidthsStorageKey(baseName)) ?? "{}");
  } catch {
    return {};
  }
}

function columnWidthsStorageKey(baseName) {
  return "silverbullet.obsidianBases.columnWidths." + baseName;
}

function clampColumnWidth(width) {
  const number = Number(width);
  if (!Number.isFinite(number)) {
    return DEFAULT_COLUMN_WIDTH;
  }
  return Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, Math.round(number)));
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function rememberCellValue(event) {
  const cell = event.target.closest?.("td[contenteditable]");
  if (cell) {
    cell.dataset.originalValue = cell.textContent;
  }
}

function handleCellKeydown(event) {
  const cell = event.target.closest?.("td[contenteditable]");
  if (!cell) {
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    cell.blur();
  } else if (event.key === "Escape") {
    event.preventDefault();
    cell.textContent = cell.dataset.originalValue ?? "";
    cell.blur();
  }
}

async function saveEditedCell(event) {
  const cell = event.target.closest?.("td[contenteditable]");
  if (!cell || cell.textContent === (cell.dataset.originalValue ?? "")) {
    return;
  }

  const row = window.currentModel?.rows[Number(cell.dataset.rowIndex)];
  const column = window.currentModel?.columns[Number(cell.dataset.columnIndex)];
  if (!row || !column) {
    return;
  }

  const path = row.file.file.path;
  try {
    setStatus("Saving...");
    const markdown = await readFileText(path);
    await writeFileText(path, updateMarkdownFrontmatterValue(markdown, column.property, cell.textContent));
    const rows = await loadMarkdownRows();
    renderModel(buildTableModel(currentBaseConfig, rows), currentBaseName);
  } catch (error) {
    cell.textContent = cell.dataset.originalValue ?? "";
    setStatus("Save failed");
    console.error(error);
  }
}

function setStatus(text) {
  const status = document.getElementById("status");
  if (status) {
    status.textContent = text;
  }
}

async function openBase(event) {
  try {
    const detail = event.detail ?? event;
    const meta = detail.meta ?? {};
    const data = detail.data;
    const yamlText = typeof data === "string" ? data : decoder.decode(data);
    const baseConfig = parseYaml(yamlText);
    currentBaseConfig = baseConfig;
    currentBaseName = meta.name ?? "Base";
    currentBasePath = meta.name ?? meta.path ?? "";
    currentSort = null;
    const rows = await loadMarkdownRows();
    renderModel(buildTableModel(baseConfig, rows), currentBaseName);
  } catch (error) {
    document.body.innerHTML = '<main><div class="error">' + escapeHtml(error.message ?? error) + '</div></main>';
    console.error(error);
  }
}

window.silverbullet?.addEventListener?.("file-open", openBase);
window.silverbullet?.addEventLister?.("file-open", openBase);
`;

await mkdir(new URL("../src/generated", import.meta.url), { recursive: true });
await writeFile(
  new URL("../src/generated/viewer-script.js", import.meta.url),
  `export const viewerScript = ${JSON.stringify(viewerSource)};\n`,
);
