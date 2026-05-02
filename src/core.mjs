export function parseYaml(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n")
    .map((raw) => ({ raw, indent: raw.match(/^ */)[0].length, text: raw.trim() }))
    .filter((line) => line.text !== "" && !line.text.startsWith("#"));

  const [value] = parseBlock(lines, 0, 0);
  return value ?? {};
}

export function parseMarkdownFrontmatter(text) {
  const normalized = text.replace(/\r\n?/g, "\n");
  const bounds = findFrontmatterBounds(normalized);
  if (!bounds) {
    return {};
  }
  return parseYaml(normalized.slice(bounds.contentStart, bounds.contentEnd));
}

export function evaluateFilter(filter, row, warnings = []) {
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
  warnings.push(`Unsupported filter object: ${JSON.stringify(filter)}`);
  return false;
}

export function buildTableModel(baseConfig, files) {
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

export function updateMarkdownFrontmatterValue(markdown, property, textValue) {
  if (!isEditableProperty(property)) {
    throw new Error(`Cannot edit read-only property: ${property}`);
  }

  const normalized = markdown.replace(/\r\n?/g, "\n");
  const key = frontmatterKey(property);
  const frontmatter = parseMarkdownFrontmatter(normalized);
  frontmatter[key] = parseEditedValue(textValue, frontmatter[key]);

  const yaml = serializeFlatYaml(frontmatter);
  const nextFrontmatter = `---\n${yaml}${yaml ? "\n" : ""}---\n`;
  const bounds = findFrontmatterBounds(normalized);
  if (!bounds) {
    return `${nextFrontmatter}${normalized}`;
  }
  return `${normalized.slice(0, bounds.blockStart)}${nextFrontmatter}${normalized.slice(bounds.blockEnd)}`;
}

export function makeRowFromFile(meta, markdown) {
  const path = normalizePath(meta.name ?? meta.path ?? "");
  const name = path.split("/").pop() ?? path;
  const ext = name.includes(".") ? name.split(".").pop() : "";
  const folder = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";

  return {
    file: {
      name: name.replace(/\.[^.]+$/, ""),
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
    throw new Error(`Invalid YAML mapping line: ${text}`);
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
  if (/^-?\d+(\.\d+)?$/.test(text)) {
    return Number(text);
  }
  return text;
}

function findFrontmatterBounds(text) {
  if (!text.startsWith("---\n")) {
    return null;
  }
  const contentStart = 4;
  const closingStart = text.indexOf("\n---", contentStart);
  if (closingStart === -1) {
    return null;
  }
  const closingLineEnd = text.indexOf("\n", closingStart + 1);
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
  if (typeof previousValue === "number" && /^-?\d+(\.\d+)?$/.test(text)) {
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
    .join("\n");
}

function serializeYamlEntry(key, value) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${key}: []`;
    }
    return `${key}:\n${value.map((item) => `  - ${serializeScalar(item)}`).join("\n")}`;
  }
  return `${key}: ${serializeScalar(value)}`;
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
  if (/[:#\[\]{},&*!|>'"%@`]/.test(text) || /^\s|\s$|^(true|false|null|~|-?\d+(\.\d+)?)$/i.test(text)) {
    return JSON.stringify(text);
  }
  return text;
}

function evaluateFilterExpression(expression, row, warnings) {
  const match = expression.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!match) {
    warnings.push(`Unsupported filter expression: ${expression}`);
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
      warnings.push(`Unsupported filter operator: ${operator}`);
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
  return path.replace(/^\/+/, "").replace(/\\/g, "/");
}

function unique(values) {
  return [...new Set(values)];
}
