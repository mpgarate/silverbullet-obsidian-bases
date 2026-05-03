import { viewerScript } from "./generated/viewer-script.js";

export async function editor() {
  return {
    html: `<!doctype html>
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
      table-layout: fixed;
      width: var(--table-width, 100%);
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
      cursor: pointer;
      display: flex;
      gap: 8px;
      min-height: 20px;
    }
    .column-label {
      flex: 1 1 auto;
      min-width: 0;
      outline: 0;
    }
    .column-label[contenteditable="true"] {
      cursor: text;
    }
    .column-label[contenteditable="true"]:hover,
    .column-label[contenteditable="true"]:focus {
      color: inherit;
      background: light-dark(#eef6ff, #102a43);
      box-shadow: 0 0 0 2px light-dark(#2563eb, #7dd3fc);
    }
    .sort-indicator {
      flex: 0 0 auto;
      font-size: 12px;
      line-height: 1;
      min-width: 10px;
    }
    .column-resizer {
      background: transparent;
      border: 0;
      border-radius: 3px;
      bottom: 0;
      color: inherit;
      cursor: col-resize;
      position: absolute;
      right: 0;
      top: 0;
      width: 8px;
      padding: 0;
      touch-action: none;
      z-index: 2;
    }
    .column-resizer::after {
      background: color-mix(in srgb, CanvasText 24%, Canvas);
      bottom: 3px;
      content: "";
      position: absolute;
      right: 0;
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
      cursor: pointer;
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
  <script>${viewerScript}</script>
</body>
</html>`,
  };
}
