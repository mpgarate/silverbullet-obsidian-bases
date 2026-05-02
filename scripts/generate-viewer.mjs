import { mkdir, readFile, writeFile } from "node:fs/promises";

const coreSource = await readFile(new URL("../src/core.mjs", import.meta.url), "utf8");
const browserCore = coreSource.replace(/^export /gm, "");

const viewerSource = `${browserCore}

const decoder = new TextDecoder();

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
  const warningHtml = model.warnings.length
    ? '<div class="warnings">' + model.warnings.map(escapeHtml).join("<br>") + "</div>"
    : "";
  const headerHtml = model.columns.map((column) => '<th>' + escapeHtml(column.label) + '</th>').join("");
  const rowHtml = model.rows.map((row) => (
    '<tr>' + row.cells.map((cell) => '<td>' + escapeHtml(cell) + '</td>').join("") + '</tr>'
  )).join("");

  document.body.innerHTML = '<main>' +
    '<header><h1>' + escapeHtml(baseName) + '</h1><span>' + model.rows.length + ' rows</span></header>' +
    warningHtml +
    '<div class="table-wrap"><table><thead><tr>' + headerHtml + '</tr></thead><tbody>' + rowHtml + '</tbody></table></div>' +
    '</main>';
}

async function openBase(event) {
  try {
    const detail = event.detail ?? event;
    const meta = detail.meta ?? {};
    const data = detail.data;
    const yamlText = typeof data === "string" ? data : decoder.decode(data);
    const baseConfig = parseYaml(yamlText);
    const rows = await loadMarkdownRows();
    renderModel(buildTableModel(baseConfig, rows), meta.name ?? "Base");
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
