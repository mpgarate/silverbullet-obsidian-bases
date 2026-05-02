function x(e){let n=atob(e),r=n.length,t=new Uint8Array(r);for(let i=0;i<r;i++)t[i]=n.charCodeAt(i);return t}function u(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let n="",r=e.byteLength;for(let t=0;t<r;t++)n+=String.fromCharCode(e[t]);return btoa(n)}var T=new Uint8Array(16),y=class{constructor(e="",n=1e3){this.prefix=e,this.maxCaptureSize=n,this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=n=>(...r)=>{let t=this.prefix?[this.prefix,...r]:r;this.originalConsole[n](...t),this.captureLog(n,r)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,n){let r={level:e,timestamp:Date.now(),message:n.map(t=>{if(typeof t=="string")return t;try{return JSON.stringify(t)}catch{return String(t)}}).join(" ")};this.logBuffer.push(r),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,n){if(this.logBuffer.length>0){let t=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t.map(s=>({...s,source:n})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...t)}}}},p;function b(e=""){return p=new y(e),p}var a=e=>{throw new Error("Not initialized yet")},d=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",c=new Map,l=0;d&&(globalThis.syscall=async(e,...n)=>await new Promise((r,t)=>{l++,c.set(l,{resolve:r,reject:t}),a({type:"sys",id:l,name:e,args:n})}));function f(e,n,r){d&&(a=r,self.addEventListener("message",t=>{(async()=>{let i=t.data;switch(i.type){case"inv":{let s=e[i.name];if(!s)throw new Error(`Function not loaded: ${i.name}`);try{let o=await Promise.resolve(s(...i.args||[]));a({type:"invr",id:i.id,result:o})}catch(o){console.error("An exception was thrown as a result of invoking function",i.name,"error:",o.message),a({type:"invr",id:i.id,error:o.message})}}break;case"sysr":{let s=i.id,o=c.get(s);if(!o)throw Error("Invalid request id");c.delete(s),i.error?o.reject(new Error(i.error)):o.resolve(i.result)}break}})().catch(console.error)}),a({type:"manifest",manifest:n}),b(`[${n.name} plug]`))}async function v(e,n){if(typeof e!="string"){let r=new Uint8Array(await e.arrayBuffer()),t=r.length>0?u(r):void 0;n={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:t},e=e.url}return syscall("sandboxFetch.fetch",e,n)}globalThis.nativeFetch=globalThis.fetch;function k(){globalThis.fetch=async(e,n)=>{let r=n?.body?u(new Uint8Array(await new Response(n.body).arrayBuffer())):void 0,t=await v(e,n&&{method:n.method,headers:n.headers,base64Body:r});return new Response(t.base64Body?x(t.base64Body):null,{status:t.status,headers:t.headers})}}d&&k();var m=`function parseYaml(text) {
  const lines = text.replace(/\\r\\n?/g, "\\n").split("\\n")
    .map((raw) => ({ raw, indent: raw.match(/^ */)[0].length, text: raw.trim() }))
    .filter((line) => line.text !== "" && !line.text.startsWith("#"));

  const [value] = parseBlock(lines, 0, 0);
  return value ?? {};
}

function parseMarkdownFrontmatter(text) {
  const normalized = text.replace(/\\r\\n?/g, "\\n");
  if (!normalized.startsWith("---\\n")) {
    return {};
  }
  const end = normalized.indexOf("\\n---", 4);
  if (end === -1) {
    return {};
  }
  return parseYaml(normalized.slice(4, end));
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
  }));

  const rows = files
    .filter((file) => evaluateFilter(combinedFilter, file, warnings))
    .map((file) => ({
      file,
      cells: columns.map((column) => formatValue(resolveProperty(file, column.property))),
    }));

  return { columns, rows, warnings: unique(warnings) };
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
</html>`}}var g={editor:h},w={name:"obsidian-bases",functions:{editor:{path:"./src/editor.js:editor",editor:["base"]}},assets:{}},W={manifest:w,functionMapping:g};f(g,w,self.postMessage);export{W as plug};
//# sourceMappingURL=obsidian-bases.plug.js.map
