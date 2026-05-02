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
