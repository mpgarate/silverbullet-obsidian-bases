import { dump as yamlDump, load as yamlLoad } from "js-yaml";

export function parseYaml(text) {
  const value = yamlLoad(text ?? "");
  if (value == null) {
    return {};
  }
  return value;
}

export function serializeYaml(value) {
  return yamlDump(value ?? {}, { lineWidth: -1, noRefs: true });
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
    width: columnWidth(view, property),
  }));

  const rows = files
    .filter((file) => evaluateFilter(combinedFilter, file, warnings))
    .map((file) => ({
      file,
      values: columns.map((column) => resolveProperty(file, column.property)),
      cells: columns.map((column) => formatValue(resolveProperty(file, column.property), column.property)),
    }));

  return { columns, rows, warnings: unique(warnings) };
}

export function sortTableRows(rows, columnIndex, direction) {
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

export function renameMarkdownFrontmatterProperty(markdown, oldProperty, newProperty) {
  if (!isEditableProperty(oldProperty) || !isEditableProperty(newProperty)) {
    throw new Error("Cannot rename read-only file properties.");
  }

  const oldKey = frontmatterKey(oldProperty);
  const newKey = frontmatterKey(newProperty);
  if (!oldKey || !newKey) {
    throw new Error("Property names cannot be empty.");
  }
  if (oldKey === newKey) {
    return markdown;
  }

  const normalized = markdown.replace(/\r\n?/g, "\n");
  const frontmatter = parseMarkdownFrontmatter(normalized);
  if (!Object.hasOwn(frontmatter, oldKey)) {
    return normalized;
  }
  if (Object.hasOwn(frontmatter, newKey)) {
    throw new Error(`Cannot rename ${oldKey} to ${newKey}; target property already exists.`);
  }

  const renamed = {};
  for (const [key, value] of Object.entries(frontmatter)) {
    renamed[key === oldKey ? newKey : key] = value;
  }

  const yaml = serializeFlatYaml(renamed);
  const nextFrontmatter = `---\n${yaml}${yaml ? "\n" : ""}---\n`;
  const bounds = findFrontmatterBounds(normalized);
  if (!bounds) {
    return `${nextFrontmatter}${normalized}`;
  }
  return `${normalized.slice(0, bounds.blockStart)}${nextFrontmatter}${normalized.slice(bounds.blockEnd)}`;
}

export function renameBaseProperty(baseConfig, oldProperty, newProperty) {
  if (!isEditableProperty(oldProperty) || !isEditableProperty(newProperty)) {
    throw new Error("Cannot rename read-only file properties.");
  }

  const normalizedNewProperty = normalizeRenamedProperty(oldProperty, newProperty);
  if (!frontmatterKey(normalizedNewProperty)) {
    throw new Error("Property names cannot be empty.");
  }
  if (oldProperty === normalizedNewProperty) {
    return baseConfig;
  }

  const renamed = renamePropertyReferences(baseConfig, oldProperty, normalizedNewProperty);
  const propertyConfig = renamed.properties?.[frontmatterKey(normalizedNewProperty)];
  if (propertyConfig && typeof propertyConfig === "object" && Object.hasOwn(propertyConfig, "displayName")) {
    propertyConfig.displayName = frontmatterKey(normalizedNewProperty);
  }
  return renamed;
}

export function buildNewEntryDraft(baseConfig, basePath, title) {
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
  const markdown = `---\n${yaml}${yaml ? "\n" : ""}---\n`;
  return { path, markdown };
}

export function makeRowFromFile(meta, markdown) {
  const path = normalizePath(meta.name ?? meta.path ?? "");
  const name = path.split("/").pop() ?? path;
  const ext = name.includes(".") ? name.split(".").pop() : "";
  const folder = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";

  return {
    file: {
      name: name.replace(/\.[^.]+$/, ""),
      basename: name.replace(/\.[^.]+$/, ""),
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

export function entryFileName(title) {
  const normalized = String(title ?? "")
    .trim()
    .replace(/\.md$/i, "")
    .replace(/[\\/]/g, "-")
    .replace(/[\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ");
  return `${normalized || "Untitled"}.md`;
}

export function renamedPagePath(currentPath, title) {
  const normalizedPath = normalizePath(currentPath);
  const folder = normalizedPath.includes("/") ? normalizedPath.slice(0, normalizedPath.lastIndexOf("/")) : "";
  return normalizePath([folder, entryFileName(title)].filter(Boolean).join("/"));
}

export function buildBaseSearchContent(path, yamlText) {
  const baseName = normalizePath(path).split("/").pop()?.replace(/\.base$/i, "") ?? "";
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
    .join("\n");
}

export function clickableUrl(value) {
  const text = String(value ?? "").trim();
  if (text === "" || /\s/.test(text)) {
    return null;
  }
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
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

function normalizeRenamedProperty(oldProperty, newProperty) {
  const text = String(newProperty ?? "").trim();
  if (oldProperty.startsWith("note.") && !text.startsWith("note.") && !text.startsWith("file.")) {
    return `note.${text}`;
  }
  return text;
}

function renamePropertyReferences(value, oldProperty, newProperty) {
  if (Array.isArray(value)) {
    return value.map((item) => renamePropertyReferences(item, oldProperty, newProperty));
  }
  if (value == null || typeof value !== "object") {
    return renamePropertyExpression(value, oldProperty, newProperty);
  }

  const renamed = {};
  for (const [key, item] of Object.entries(value)) {
    const nextKey = renamePropertyReferenceKey(key, oldProperty, newProperty);
    if (Object.hasOwn(renamed, nextKey)) {
      throw new Error(`Cannot rename ${key} to ${nextKey}; target property already exists.`);
    }
    renamed[nextKey] = renamePropertyReferences(item, oldProperty, newProperty);
  }
  return renamed;
}

function renamePropertyReferenceKey(key, oldProperty, newProperty) {
  if (key === oldProperty) {
    return newProperty;
  }
  const oldKey = frontmatterKey(oldProperty);
  const newKey = frontmatterKey(newProperty);
  if (key === oldKey) {
    return newKey;
  }
  if (key === `note.${oldKey}`) {
    return `note.${newKey}`;
  }
  return key;
}

function renamePropertyExpression(value, oldProperty, newProperty) {
  if (typeof value !== "string") {
    return value;
  }
  const operatorMatch = value.match(/^(.+?)(\s*(?:==|!=|>=|<=|>|<)\s*.+)$/);
  if (!operatorMatch) {
    return renamePropertyReferenceKey(value, oldProperty, newProperty);
  }
  const left = operatorMatch[1].trim();
  const nextLeft = renamePropertyReferenceKey(left, oldProperty, newProperty);
  if (left === nextLeft) {
    return value;
  }
  return nextLeft + operatorMatch[2];
}

function serializeFlatYaml(value) {
  if (Object.keys(value).length === 0) {
    return "";
  }
  return yamlDump(value, { lineWidth: -1, noRefs: true }).replace(/\n+$/, "");
}

function evaluateFilterExpression(expression, row, warnings) {
  const tagMatch = expression.match(/^file\.hasTag\((.+)\)$/);
  if (tagMatch) {
    return fileHasTag(row, parseScalar(tagMatch[1].trim()));
  }

  const inFolderMatch = expression.match(/^file\.inFolder\((.+)\)$/);
  if (inFolderMatch) {
    return fileInFolder(row, parseScalar(inFolderMatch[1].trim()));
  }

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

function fileHasTag(row, tag) {
  if (typeof tag !== "string" || tag === "") {
    return false;
  }
  const tags = row.note?.tags;
  if (Array.isArray(tags)) {
    return tags.includes(tag);
  }
  return tags === tag;
}

function fileInFolder(row, folder) {
  if (typeof folder !== "string") {
    return false;
  }
  const expectedFolder = normalizePath(folder.trim()).replace(/\/+$/, "");
  const actualFolder = normalizePath(row.file?.folder ?? "").replace(/\/+$/, "");
  if (expectedFolder === "") {
    return actualFolder === "";
  }
  return actualFolder === expectedFolder || actualFolder.startsWith(`${expectedFolder}/`);
}

function collectEqualityFilters(filter) {
  if (!filter) {
    return [];
  }
  if (typeof filter === "string") {
    const match = filter.match(/^(.+?)\s*==\s*(.+)$/);
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
  return [property, `note.${property}`];
}

function formatValue(value, property = "") {
  if (value == null) {
    return "";
  }
  if (property === "file.mtime" || property === "file.ctime") {
    return formatDateTime(value);
  }
  if (Array.isArray(value)) {
    return value.filter((item) => item != null && item !== "").join(", ");
  }
  return String(value);
}

function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
  if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value.trim())) {
    return Number(value);
  }
  return null;
}

function normalizePath(path) {
  return path.replace(/^\/+/, "").replace(/\\/g, "/");
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
    .split(/\r?\n/)
    .map((line) => line.trim());
}
