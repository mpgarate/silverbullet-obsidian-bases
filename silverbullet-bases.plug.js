function W(n){let e=atob(n),i=e.length,t=new Uint8Array(i);for(let r=0;r<i;r++)t[r]=e.charCodeAt(r);return t}function g(n){typeof n=="string"&&(n=new TextEncoder().encode(n));let e="",i=n.byteLength;for(let t=0;t<i;t++)e+=String.fromCharCode(n[t]);return btoa(e)}var P=new Uint8Array(16),F=class{constructor(n="",e=1e3){this.prefix=n,this.maxCaptureSize=e,this.prefix=n,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let n=e=>(...i)=>{let t=this.prefix?[this.prefix,...i]:i;this.originalConsole[e](...t),this.captureLog(e,i)};console.log=n("log"),console.info=n("info"),console.warn=n("warn"),console.error=n("error"),console.debug=n("debug")}captureLog(n,e){let i={level:n,timestamp:Date.now(),message:e.map(t=>{if(typeof t=="string")return t;try{return JSON.stringify(t)}catch{return String(t)}}).join(" ")};this.logBuffer.push(i),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(n,e){if(this.logBuffer.length>0){let t=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t.map(a=>({...a,source:e})))})).ok)throw new Error("Failed to post logs to server")}catch(r){console.warn("Could not post logs to server",r.message),this.logBuffer.unshift(...t)}}}},y;function N(n=""){return y=new F(n),y}var s=n=>{throw new Error("Not initialized yet")},f=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",m=new Map,d=0;f&&(globalThis.syscall=async(n,...e)=>await new Promise((i,t)=>{d++,m.set(d,{resolve:i,reject:t}),s({type:"sys",id:d,name:n,args:e})}));function b(n,e,i){f&&(s=i,self.addEventListener("message",t=>{(async()=>{let r=t.data;switch(r.type){case"inv":{let a=n[r.name];if(!a)throw new Error(`Function not loaded: ${r.name}`);try{let o=await Promise.resolve(a(...r.args||[]));s({type:"invr",id:r.id,result:o})}catch(o){console.error("An exception was thrown as a result of invoking function",r.name,"error:",o.message),s({type:"invr",id:r.id,error:o.message})}}break;case"sysr":{let a=r.id,o=m.get(a);if(!o)throw Error("Invalid request id");m.delete(a),r.error?o.reject(new Error(r.error)):o.resolve(r.result)}break}})().catch(console.error)}),s({type:"manifest",manifest:e}),N(`[${e.name} plug]`))}async function T(n,e){if(typeof n!="string"){let i=new Uint8Array(await n.arrayBuffer()),t=i.length>0?g(i):void 0;e={method:n.method,headers:Object.fromEntries(n.headers.entries()),base64Body:t},n=n.url}return syscall("sandboxFetch.fetch",n,e)}globalThis.nativeFetch=globalThis.fetch;function B(){globalThis.fetch=async(n,e)=>{let i=e?.body?g(new Uint8Array(await new Response(e.body).arrayBuffer())):void 0,t=await T(n,e&&{method:e.method,headers:e.headers,base64Body:i});return new Response(t.base64Body?W(t.base64Body):null,{status:t.status,headers:t.headers})}}f&&B();var w=`function parseYaml(text) {
  const lines = text.replace(/\\r\\n?/g, "\\n").split("\\n")
    .map((raw) => ({ raw, indent: raw.match(/^ */)[0].length, text: raw.trim() }))
    .filter((line) => line.text !== "" && !line.text.startsWith("#"));

  const [value] = parseBlock(lines, 0, 0);
  return value ?? {};
}

function parseMarkdownFrontmatter(text) {
  const normalized = text.replace(/\\r\\n?/g, "\\n");
  const bounds = findFrontmatterBounds(normalized);
  if (!bounds) {
    return {};
  }
  return parseYaml(normalized.slice(bounds.contentStart, bounds.contentEnd));
}

function evaluateFilter(filter, row, warnings = []) {
  if (!filter) {
    return true;
  }
  if (typeof filter === "string") {
    return evaluateFilterExpression(filter, row, warnings);
  }
  if (Array.isArray(filter)) {
    return filter.every((child) => evaluateFilter(child, row, warnings));
  }
  if (filter.and) {
    return filter.and.every((child) => evaluateFilter(child, row, warnings));
  }
  if (filter.or) {
    return filter.or.some((child) => evaluateFilter(child, row, warnings));
  }
  if (filter.not) {
    return !filter.not.some((child) => evaluateFilter(child, row, warnings));
  }
  warnings.push(\`Unsupported filter object: \${JSON.stringify(filter)}\`);
  return false;
}

function buildTableModel(baseConfig, files) {
  const warnings = [];
  const view = (baseConfig.views ?? []).find((candidate) => candidate.type === "table");
  if (!view) {
    return { columns: [], rows: [], warnings: ["No table view found in base file."] };
  }

  const combinedFilter = { and: [baseConfig.filters, view.filters].filter(Boolean) };
  const columns = (view.order ?? ["file.name"]).map((property) => ({
    property,
    label: propertyLabel(baseConfig, property),
    editable: isEditableProperty(property),
    width: columnWidth(view, property),
  }));

  const rows = files
    .filter((file) => evaluateFilter(combinedFilter, file, warnings))
    .map((file) => ({
      file,
      values: columns.map((column) => resolveProperty(file, column.property)),
      cells: columns.map((column) => formatValue(resolveProperty(file, column.property))),
    }));

  return { columns, rows, warnings: unique(warnings) };
}

function sortTableRows(rows, columnIndex, direction) {
  if (direction !== "ascending" && direction !== "descending") {
    return [...rows];
  }
  const multiplier = direction === "ascending" ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const comparison = compareSortValues(
        sortValueForRow(left.row, columnIndex),
        sortValueForRow(right.row, columnIndex),
      );
      return comparison === 0 ? left.index - right.index : comparison * multiplier;
    })
    .map((item) => item.row);
}

function updateMarkdownFrontmatterValue(markdown, property, textValue) {
  if (!isEditableProperty(property)) {
    throw new Error(\`Cannot edit read-only property: \${property}\`);
  }

  const normalized = markdown.replace(/\\r\\n?/g, "\\n");
  const key = frontmatterKey(property);
  const frontmatter = parseMarkdownFrontmatter(normalized);
  frontmatter[key] = parseEditedValue(textValue, frontmatter[key]);

  const yaml = serializeFlatYaml(frontmatter);
  const nextFrontmatter = \`---\\n\${yaml}\${yaml ? "\\n" : ""}---\\n\`;
  const bounds = findFrontmatterBounds(normalized);
  if (!bounds) {
    return \`\${nextFrontmatter}\${normalized}\`;
  }
  return \`\${normalized.slice(0, bounds.blockStart)}\${nextFrontmatter}\${normalized.slice(bounds.blockEnd)}\`;
}

function buildNewEntryDraft(baseConfig, basePath, title) {
  const view = (baseConfig.views ?? []).find((candidate) => candidate.type === "table");
  const equalityFilters = collectEqualityFilters({ and: [baseConfig.filters, view?.filters].filter(Boolean) });
  const folder = equalityFilters.find((filter) => filter.property === "file.folder")?.value
    ?? normalizePath(basePath).split("/").slice(0, -1).join("/");
  const frontmatter = {};

  for (const filter of equalityFilters) {
    if (filter.property.startsWith("file.")) {
      continue;
    }
    frontmatter[frontmatterKey(filter.property)] = filter.value;
  }

  const fileName = entryFileName(title);
  const path = normalizePath([folder, fileName].filter(Boolean).join("/"));
  const yaml = serializeFlatYaml(frontmatter);
  const markdown = \`---\\n\${yaml}\${yaml ? "\\n" : ""}---\\n\`;
  return { path, markdown };
}

function makeRowFromFile(meta, markdown) {
  const path = normalizePath(meta.name ?? meta.path ?? "");
  const name = path.split("/").pop() ?? path;
  const ext = name.includes(".") ? name.split(".").pop() : "";
  const folder = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";

  return {
    file: {
      name: name.replace(/\\.[^.]+$/, ""),
      ext,
      folder,
      path,
      size: meta.size,
      mtime: meta.modified ?? meta.lastModified,
      ctime: meta.created,
    },
    note: parseMarkdownFrontmatter(markdown),
  };
}

function entryFileName(title) {
  const normalized = String(title ?? "")
    .trim()
    .replace(/\\.md$/i, "")
    .replace(/[\\\\/]/g, "-")
    .replace(/[\\u0000-\\u001f]/g, "")
    .replace(/\\s+/g, " ");
  return \`\${normalized || "Untitled"}.md\`;
}

function buildBaseSearchContent(path, yamlText) {
  const baseName = normalizePath(path).split("/").pop()?.replace(/\\.base$/i, "") ?? "";
  const parts = ["Obsidian Base", baseName];

  try {
    const baseConfig = parseYaml(yamlText);
    collectSearchableYamlValues(baseConfig, parts);
  } catch {
    // Keep malformed base files searchable by their raw source.
  }

  parts.push(yamlText);
  return unique(parts.flatMap(splitSearchContentLine))
    .filter(Boolean)
    .join("\\n");
}

function parseBlock(lines, index, indent) {
  if (index >= lines.length || lines[index].indent < indent) {
    return [null, index];
  }
  if (lines[index].text.startsWith("- ")) {
    return parseSequence(lines, index, lines[index].indent);
  }
  return parseMapping(lines, index, lines[index].indent);
}

function parseSequence(lines, index, indent) {
  const result = [];
  let i = index;
  while (i < lines.length && lines[i].indent === indent && lines[i].text.startsWith("- ")) {
    const itemText = lines[i].text.slice(2).trim();
    if (itemText === "") {
      const [child, next] = parseBlock(lines, i + 1, indent + 2);
      result.push(child);
      i = next;
    } else if (looksLikeMappingItem(itemText)) {
      const item = {};
      assignMappingValue(item, itemText, lines, i, indent + 2);
      i++;
      while (i < lines.length && lines[i].indent >= indent + 2) {
        if (lines[i].indent === indent + 2 && !lines[i].text.startsWith("- ")) {
          const [childMap, next] = parseMapping(lines, i, indent + 2);
          Object.assign(item, childMap);
          i = next;
        } else {
          break;
        }
      }
      result.push(item);
    } else {
      result.push(parseScalar(itemText));
      i++;
    }
  }
  return [result, i];
}

function parseMapping(lines, index, indent) {
  const result = {};
  let i = index;
  while (i < lines.length && lines[i].indent === indent && !lines[i].text.startsWith("- ")) {
    const lineText = lines[i].text;
    const [key, valueText] = splitKeyValue(lineText);
    if (valueText === "") {
      if (i + 1 < lines.length && lines[i + 1].indent > indent) {
        const [child, next] = parseBlock(lines, i + 1, lines[i + 1].indent);
        result[key] = child;
        i = next;
      } else {
        result[key] = null;
        i++;
      }
    } else {
      result[key] = parseScalar(valueText);
      i++;
    }
  }
  return [result, i];
}

function assignMappingValue(target, text, lines, index, childIndent) {
  const [key, valueText] = splitKeyValue(text);
  if (valueText === "" && index + 1 < lines.length && lines[index + 1].indent >= childIndent) {
    const [child] = parseBlock(lines, index + 1, childIndent);
    target[key] = child;
  } else if (valueText === "") {
    target[key] = null;
  } else {
    target[key] = parseScalar(valueText);
  }
}

function looksLikeMappingItem(text) {
  return /^[^"'][^:]+:/.test(text);
}

function splitKeyValue(text) {
  const colon = text.indexOf(":");
  if (colon === -1) {
    throw new Error(\`Invalid YAML mapping line: \${text}\`);
  }
  return [text.slice(0, colon).trim(), text.slice(colon + 1).trim()];
}

function parseScalar(text) {
  if (text === "" || text === "~" || text === "null") {
    return null;
  }
  if (text === "[]") {
    return [];
  }
  if (text === "true") {
    return true;
  }
  if (text === "false") {
    return false;
  }
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  if (/^-?\\d+(\\.\\d+)?$/.test(text)) {
    return Number(text);
  }
  return text;
}

function findFrontmatterBounds(text) {
  if (!text.startsWith("---\\n")) {
    return null;
  }
  const contentStart = 4;
  const closingStart = text.indexOf("\\n---", contentStart);
  if (closingStart === -1) {
    return null;
  }
  const closingLineEnd = text.indexOf("\\n", closingStart + 1);
  return {
    blockStart: 0,
    contentStart,
    contentEnd: closingStart,
    blockEnd: closingLineEnd === -1 ? text.length : closingLineEnd + 1,
  };
}

function isEditableProperty(property) {
  return !property.startsWith("file.");
}

function frontmatterKey(property) {
  return property.startsWith("note.") ? property.slice(5) : property;
}

function parseEditedValue(textValue, previousValue) {
  const text = String(textValue ?? "").trim();
  if (Array.isArray(previousValue)) {
    return text === "" ? [] : text.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (typeof previousValue === "number" && /^-?\\d+(\\.\\d+)?$/.test(text)) {
    return Number(text);
  }
  if (typeof previousValue === "boolean") {
    return text === "true";
  }
  return String(textValue ?? "");
}

function serializeFlatYaml(value) {
  return Object.entries(value)
    .map(([key, item]) => serializeYamlEntry(key, item))
    .join("\\n");
}

function serializeYamlEntry(key, value) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return \`\${key}: []\`;
    }
    return \`\${key}:\\n\${value.map((item) => \`  - \${serializeScalar(item)}\`).join("\\n")}\`;
  }
  return \`\${key}: \${serializeScalar(value)}\`;
}

function serializeScalar(value) {
  if (value == null) {
    return "null";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  const text = String(value);
  if (text === "") {
    return '""';
  }
  if (/[:#\\[\\]{},&*!|>'"%@\`]/.test(text) || /^\\s|\\s$|^(true|false|null|~|-?\\d+(\\.\\d+)?)$/i.test(text)) {
    return JSON.stringify(text);
  }
  return text;
}

function evaluateFilterExpression(expression, row, warnings) {
  const match = expression.match(/^(.+?)\\s*(==|!=|>=|<=|>|<)\\s*(.+)$/);
  if (!match) {
    warnings.push(\`Unsupported filter expression: \${expression}\`);
    return false;
  }
  const [, leftExpression, operator, rightExpression] = match;
  const left = resolveProperty(row, leftExpression.trim());
  const right = parseScalar(rightExpression.trim());

  switch (operator) {
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case ">":
      return left > right;
    case "<":
      return left < right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    default:
      warnings.push(\`Unsupported filter operator: \${operator}\`);
      return false;
  }
}

function collectEqualityFilters(filter) {
  if (!filter) {
    return [];
  }
  if (typeof filter === "string") {
    const match = filter.match(/^(.+?)\\s*==\\s*(.+)$/);
    if (!match) {
      return [];
    }
    return [{ property: match[1].trim(), value: parseScalar(match[2].trim()) }];
  }
  if (Array.isArray(filter)) {
    return filter.flatMap(collectEqualityFilters);
  }
  if (filter.and) {
    return filter.and.flatMap(collectEqualityFilters);
  }
  return [];
}

function resolveProperty(row, property) {
  if (property.startsWith("file.")) {
    return row.file?.[property.slice(5)];
  }
  if (property.startsWith("note.")) {
    return row.note?.[property.slice(5)];
  }
  return row.note?.[property];
}

function propertyLabel(baseConfig, property) {
  const configured = baseConfig.properties?.[property]?.displayName;
  if (configured) {
    return configured;
  }
  if (property === "file.name") {
    return "Name";
  }
  if (property.startsWith("file.")) {
    return property.slice(5);
  }
  if (property.startsWith("note.")) {
    return property.slice(5);
  }
  return property;
}

function columnWidth(view, property) {
  const columnSize = view.columnSize ?? {};
  for (const key of columnSizeKeys(property)) {
    const width = Number(columnSize[key]);
    if (Number.isFinite(width) && width > 0) {
      return width;
    }
  }
  return null;
}

function columnSizeKeys(property) {
  if (property.startsWith("file.") || property.startsWith("note.")) {
    return [property];
  }
  return [property, \`note.\${property}\`];
}

function formatValue(value) {
  if (value == null) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.filter((item) => item != null && item !== "").join(", ");
  }
  return String(value);
}

function sortValueForRow(row, columnIndex) {
  if (Array.isArray(row.values)) {
    return row.values[columnIndex];
  }
  return row.cells?.[columnIndex];
}

function compareSortValues(left, right) {
  const leftMissing = left == null || left === "";
  const rightMissing = right == null || right === "";
  if (leftMissing || rightMissing) {
    return leftMissing === rightMissing ? 0 : leftMissing ? 1 : -1;
  }

  if (Array.isArray(left)) {
    left = left.filter((item) => item != null && item !== "").join(", ");
  }
  if (Array.isArray(right)) {
    right = right.filter((item) => item != null && item !== "").join(", ");
  }

  const leftNumber = sortableNumber(left);
  const rightNumber = sortableNumber(right);
  if (leftNumber != null && rightNumber != null) {
    return leftNumber === rightNumber ? 0 : leftNumber < rightNumber ? -1 : 1;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function sortableNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && /^-?\\d+(\\.\\d+)?$/.test(value.trim())) {
    return Number(value);
  }
  return null;
}

function normalizePath(path) {
  return path.replace(/^\\/+/, "").replace(/\\\\/g, "/");
}

function unique(values) {
  return [...new Set(values)];
}

function collectSearchableYamlValues(value, parts) {
  if (value == null) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectSearchableYamlValues(item, parts);
    }
    return;
  }
  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      parts.push(key);
      collectSearchableYamlValues(item, parts);
    }
    return;
  }
  parts.push(String(value));
}

function splitSearchContentLine(value) {
  return String(value)
    .split(/\\r?\\n/)
    .map((line) => line.trim());
}


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
`;async function x(){return{html:`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      color-scheme: light dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.4;
    }
    body {
      margin: 0;
      color: CanvasText;
      background: Canvas;
    }
    main {
      padding: 18px;
    }
    header {
      align-items: baseline;
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    h1 {
      font-size: 20px;
      font-weight: 650;
      margin: 0;
    }
    header span {
      color: color-mix(in srgb, CanvasText 58%, Canvas);
      font-size: 13px;
      white-space: nowrap;
    }
    .header-actions {
      align-items: center;
      display: flex;
      gap: 10px;
    }
    button {
      background: light-dark(#f8fafc, #172033);
      border: 1px solid color-mix(in srgb, CanvasText 24%, Canvas);
      border-radius: 5px;
      color: CanvasText;
      cursor: pointer;
      font: inherit;
      font-size: 13px;
      line-height: 1.2;
      padding: 5px 9px;
    }
    button:hover,
    button:focus-visible {
      border-color: light-dark(#2563eb, #7dd3fc);
      outline: 0;
    }
    .table-wrap {
      border: 1px solid color-mix(in srgb, CanvasText 18%, Canvas);
      border-radius: 6px;
      overflow: auto;
    }
    table {
      border-collapse: collapse;
      font-size: 14px;
      min-width: 100%;
      table-layout: fixed;
      width: max(100%, var(--table-width, 100%));
    }
    th,
    td {
      border-bottom: 1px solid color-mix(in srgb, CanvasText 14%, Canvas);
      overflow: hidden;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: normal;
    }
    th {
      background: color-mix(in srgb, CanvasText 6%, Canvas);
      font-weight: 620;
      position: sticky;
      top: 0;
      user-select: none;
    }
    .column-header {
      align-items: center;
      display: flex;
      gap: 8px;
      min-height: 20px;
    }
    .column-label {
      flex: 1 1 auto;
      min-width: 0;
    }
    .column-sort {
      align-items: center;
      background: transparent;
      border: 0;
      color: inherit;
      display: flex;
      flex: 1 1 auto;
      font: inherit;
      font-weight: inherit;
      gap: 3px;
      min-width: 0;
      padding: 0;
      text-align: left;
    }
    .column-sort:hover,
    .column-sort:focus-visible {
      color: light-dark(#1d4ed8, #93c5fd);
      outline: 0;
    }
    .sort-indicator {
      flex: 0 0 auto;
      font-size: 12px;
      line-height: 1;
      min-width: 10px;
    }
    .column-resizer {
      align-self: stretch;
      background: transparent;
      border: 0;
      border-radius: 3px;
      color: inherit;
      cursor: col-resize;
      flex: 0 0 10px;
      margin: -4px -8px -4px 0;
      padding: 0;
      position: relative;
      touch-action: none;
    }
    .column-resizer::after {
      background: color-mix(in srgb, CanvasText 24%, Canvas);
      bottom: 3px;
      content: "";
      position: absolute;
      right: 4px;
      top: 3px;
      width: 1px;
    }
    .column-resizer:hover::after,
    .column-resizer:focus-visible::after,
    body.resizing-column .column-resizer.active::after {
      background: light-dark(#2563eb, #7dd3fc);
      width: 2px;
    }
    tr:last-child td {
      border-bottom: 0;
    }
    td[contenteditable="true"] {
      cursor: text;
      outline: 0;
    }
    td[contenteditable="true"]:focus {
      background: light-dark(#eef6ff, #102a43);
      box-shadow: inset 0 0 0 2px light-dark(#2563eb, #7dd3fc);
    }
    .page-link {
      color: light-dark(#1d4ed8, #93c5fd);
      text-decoration: none;
    }
    .page-link:hover,
    .page-link:focus-visible {
      text-decoration: underline;
    }
    .warnings,
    .error {
      border-radius: 6px;
      margin-bottom: 12px;
      padding: 10px 12px;
    }
    .warnings {
      background: light-dark(#fff7d6, #3b300c);
      color: light-dark(#5b4500, #ffe08a);
    }
    .error {
      background: light-dark(#ffe3e3, #4a1515);
      color: light-dark(#7f1d1d, #fecaca);
    }
  </style>
</head>
<body>
  <main>Loading base...</main>
  <script>${w}<\/script>
</body>
</html>`}}function $(n){let e=n.replace(/\r\n?/g,`
`).split(`
`).map(t=>({raw:t,indent:t.match(/^ */)[0].length,text:t.trim()})).filter(t=>t.text!==""&&!t.text.startsWith("#")),[i]=c(e,0,0);return i??{}}function v(n,e){let t=["Obsidian Base",R(n).split("/").pop()?.replace(/\.base$/i,"")??""];try{let r=$(e);p(r,t)}catch{}return t.push(e),V(t.flatMap(j)).filter(Boolean).join(`
`)}function c(n,e,i){return e>=n.length||n[e].indent<i?[null,e]:n[e].text.startsWith("- ")?I(n,e,n[e].indent):S(n,e,n[e].indent)}function I(n,e,i){let t=[],r=e;for(;r<n.length&&n[r].indent===i&&n[r].text.startsWith("- ");){let a=n[r].text.slice(2).trim();if(a===""){let[o,l]=c(n,r+1,i+2);t.push(o),r=l}else if(A(a)){let o={};for(L(o,a,n,r,i+2),r++;r<n.length&&n[r].indent>=i+2&&(n[r].indent===i+2&&!n[r].text.startsWith("- "));){let[l,u]=S(n,r,i+2);Object.assign(o,l),r=u}t.push(o)}else t.push(h(a)),r++}return[t,r]}function S(n,e,i){let t={},r=e;for(;r<n.length&&n[r].indent===i&&!n[r].text.startsWith("- ");){let a=n[r].text,[o,l]=C(a);if(l==="")if(r+1<n.length&&n[r+1].indent>i){let[u,z]=c(n,r+1,n[r+1].indent);t[o]=u,r=z}else t[o]=null,r++;else t[o]=h(l),r++}return[t,r]}function L(n,e,i,t,r){let[a,o]=C(e);if(o===""&&t+1<i.length&&i[t+1].indent>=r){let[l]=c(i,t+1,r);n[a]=l}else o===""?n[a]=null:n[a]=h(o)}function A(n){return/^[^"'][^:]+:/.test(n)}function C(n){let e=n.indexOf(":");if(e===-1)throw new Error(`Invalid YAML mapping line: ${n}`);return[n.slice(0,e).trim(),n.slice(e+1).trim()]}function h(n){return n===""||n==="~"||n==="null"?null:n==="[]"?[]:n==="true"?!0:n==="false"?!1:n.startsWith('"')&&n.endsWith('"')||n.startsWith("'")&&n.endsWith("'")?n.slice(1,-1):/^-?\d+(\.\d+)?$/.test(n)?Number(n):n}function R(n){return n.replace(/^\/+/,"").replace(/\\/g,"/")}function V(n){return[...new Set(n)]}function p(n,e){if(n!=null){if(Array.isArray(n)){for(let i of n)p(i,e);return}if(typeof n=="object"){for(let[i,t]of Object.entries(n))e.push(i),p(t,e);return}e.push(String(n))}}function j(n){return String(n).split(/\r?\n/).map(e=>e.trim())}var O=new TextDecoder;async function k(n){let e=n?.meta??{},i=e.name??e.path??"";if(!i.toLowerCase().endsWith(".base"))return null;let t=await syscall("space.readFile",i),r=typeof t=="string"?t:O.decode(t);return{content:v(i,r),cacheMode:"session"}}var M={editor:x,indexBaseDocument:k},E={name:"silverbullet-bases",functions:{editor:{path:"./src/editor.js:editor",editor:["base"]},indexBaseDocument:{path:"./src/silversearch.js:indexBaseDocument",events:["silversearch:index"]}},assets:{}},Z={manifest:E,functionMapping:M};b(M,E,self.postMessage);export{Z as plug};
//# sourceMappingURL=silverbullet-bases.plug.js.map
