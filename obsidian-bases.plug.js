function x(n){let e=atob(n),r=e.length,t=new Uint8Array(r);for(let i=0;i<r;i++)t[i]=e.charCodeAt(i);return t}function p(n){typeof n=="string"&&(n=new TextEncoder().encode(n));let e="",r=n.byteLength;for(let t=0;t<r;t++)e+=String.fromCharCode(n[t]);return btoa(e)}var S=new Uint8Array(16),y=class{constructor(n="",e=1e3){this.prefix=n,this.maxCaptureSize=e,this.prefix=n,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let n=e=>(...r)=>{let t=this.prefix?[this.prefix,...r]:r;this.originalConsole[e](...t),this.captureLog(e,r)};console.log=n("log"),console.info=n("info"),console.warn=n("warn"),console.error=n("error"),console.debug=n("debug")}captureLog(n,e){let r={level:n,timestamp:Date.now(),message:e.map(t=>{if(typeof t=="string")return t;try{return JSON.stringify(t)}catch{return String(t)}}).join(" ")};this.logBuffer.push(r),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(n,e){if(this.logBuffer.length>0){let t=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t.map(a=>({...a,source:e})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...t)}}}},u;function b(n=""){return u=new y(n),u}var l=n=>{throw new Error("Not initialized yet")},d=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",c=new Map,s=0;d&&(globalThis.syscall=async(n,...e)=>await new Promise((r,t)=>{s++,c.set(s,{resolve:r,reject:t}),l({type:"sys",id:s,name:n,args:e})}));function f(n,e,r){d&&(l=r,self.addEventListener("message",t=>{(async()=>{let i=t.data;switch(i.type){case"inv":{let a=n[i.name];if(!a)throw new Error(`Function not loaded: ${i.name}`);try{let o=await Promise.resolve(a(...i.args||[]));l({type:"invr",id:i.id,result:o})}catch(o){console.error("An exception was thrown as a result of invoking function",i.name,"error:",o.message),l({type:"invr",id:i.id,error:o.message})}}break;case"sysr":{let a=i.id,o=c.get(a);if(!o)throw Error("Invalid request id");c.delete(a),i.error?o.reject(new Error(i.error)):o.resolve(i.result)}break}})().catch(console.error)}),l({type:"manifest",manifest:e}),b(`[${e.name} plug]`))}async function v(n,e){if(typeof n!="string"){let r=new Uint8Array(await n.arrayBuffer()),t=r.length>0?p(r):void 0;e={method:n.method,headers:Object.fromEntries(n.headers.entries()),base64Body:t},n=n.url}return syscall("sandboxFetch.fetch",n,e)}globalThis.nativeFetch=globalThis.fetch;function k(){globalThis.fetch=async(n,e)=>{let r=e?.body?p(new Uint8Array(await new Response(e.body).arrayBuffer())):void 0,t=await v(n,e&&{method:e.method,headers:e.headers,base64Body:r});return new Response(t.base64Body?x(t.base64Body):null,{status:t.status,headers:t.headers})}}d&&k();var m=`function parseYaml(text) {
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
  }));

  const rows = files
    .filter((file) => evaluateFilter(combinedFilter, file, warnings))
    .map((file) => ({
      file,
      cells: columns.map((column) => formatValue(resolveProperty(file, column.property))),
    }));

  return { columns, rows, warnings: unique(warnings) };
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

function formatValue(value) {
  if (value == null) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.filter((item) => item != null && item !== "").join(", ");
  }
  return String(value);
}

function normalizePath(path) {
  return path.replace(/^\\/+/, "").replace(/\\\\/g, "/");
}

function unique(values) {
  return [...new Set(values)];
}


const decoder = new TextDecoder();
const encoder = new TextEncoder();
let currentBaseConfig = null;
let currentBaseName = "Base";

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
  const rowHtml = model.rows.map((row, rowIndex) => (
    '<tr>' + row.cells.map((cell, columnIndex) => {
      const column = model.columns[columnIndex];
      if (!column.editable) {
        return '<td>' + escapeHtml(cell) + '</td>';
      }
      return '<td contenteditable="true" spellcheck="false" data-row-index="' + rowIndex +
        '" data-column-index="' + columnIndex + '">' + escapeHtml(cell) + '</td>';
    }).join("") + '</tr>'
  )).join("");

  document.body.innerHTML = '<main>' +
    '<header><h1>' + escapeHtml(baseName) + '</h1><span id="status">' + model.rows.length + ' rows</span></header>' +
    warningHtml +
    '<div class="table-wrap"><table><thead><tr>' + headerHtml + '</tr></thead><tbody>' + rowHtml + '</tbody></table></div>' +
    '</main>';
  document.querySelector("tbody")?.addEventListener("focusin", rememberCellValue);
  document.querySelector("tbody")?.addEventListener("focusout", saveEditedCell);
  document.querySelector("tbody")?.addEventListener("keydown", handleCellKeydown);
  window.currentModel = model;
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
    const rows = await loadMarkdownRows();
    renderModel(buildTableModel(baseConfig, rows), currentBaseName);
  } catch (error) {
    document.body.innerHTML = '<main><div class="error">' + escapeHtml(error.message ?? error) + '</div></main>';
    console.error(error);
  }
}

window.silverbullet?.addEventListener?.("file-open", openBase);
window.silverbullet?.addEventLister?.("file-open", openBase);
`;async function h(){return{html:`<!doctype html>
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
    .table-wrap {
      border: 1px solid color-mix(in srgb, CanvasText 18%, Canvas);
      border-radius: 6px;
      overflow: auto;
    }
    table {
      border-collapse: collapse;
      font-size: 14px;
      min-width: 100%;
      table-layout: auto;
      white-space: nowrap;
    }
    th,
    td {
      border-bottom: 1px solid color-mix(in srgb, CanvasText 14%, Canvas);
      max-width: 420px;
      overflow: hidden;
      padding: 8px 10px;
      text-align: left;
      text-overflow: ellipsis;
      vertical-align: top;
    }
    th {
      background: color-mix(in srgb, CanvasText 6%, Canvas);
      font-weight: 620;
      position: sticky;
      top: 0;
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
  <script>${m}<\/script>
</body>
</html>`}}var g={editor:h},w={name:"obsidian-bases",functions:{editor:{path:"./src/editor.js:editor",editor:["base"]}},assets:{}},z={manifest:w,functionMapping:g};f(g,w,self.postMessage);export{z as plug};
//# sourceMappingURL=obsidian-bases.plug.js.map
