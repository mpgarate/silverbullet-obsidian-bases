# silverbullet-obsidian-bases

A [SilverBullet](https://silverbullet.md) plug that registers `.base` files as a document editor and renders an [Obsidian Bases](https://obsidian.md/help/bases/syntax) table view over your space's notes. Also exposes `.base` content to [Silversearch](https://silverbullet.md/Plugs/Silversearch) via the `silversearch:index` event.

## Screenshot

<img width="600" alt="image" src="https://github.com/user-attachments/assets/7f599c53-89a9-4b27-b243-0b84e6c02cc0" />


## Features

- Table views over Markdown notes using `.base` YAML configuration.
- Properties: Markdown frontmatter keys and the `file.name`, `file.basename`, `file.ext`, `file.folder`, `file.path`, `file.size`, `file.mtime`, `file.ctime` virtual properties.
- Filters: comparison operators (`==`, `!=`, `<`, `<=`, `>`, `>=`) plus `file.hasTag(...)` and `file.inFolder(...)`, combined recursively with `and` / `or` / `not`.
- Ordered columns with optional display-name overrides and persisted column widths.
- Click column headers to sort ascending → descending → unsorted.
- Whole-cell `http` and `https` URLs render as clickable links.
- In-place editing for frontmatter cells (Enter to save, Escape to cancel); editing `title` also renames the page file.
- "Add entry" creates a new note pre-populated with the base's equality filters as frontmatter.
- `.base` files are indexed by Silversearch when that plug is installed.

## Install

Recommended (Library install):

1. In SilverBullet, run the `Library: Install` command.
2. Paste the URL to this repo's `PLUG.md`, e.g. `https://github.com/mpgarate/obsidian-bases/blob/main/PLUG.md`.
3. Run `Plugs: Update` and `Plugs: Reload`.

Alternative (direct `space-lua` config):

````markdown
```space-lua
config.set {
  plugs = {
    "github:mpgarate/obsidian-bases/obsidian-bases.plug.js"
  }
}
```
````

## Build

Requires [Node.js](https://nodejs.org/).

```bash
npm install
npm run build
```

`npm run build` regenerates the iframe viewer script and compiles the distributable `obsidian-bases.plug.js` bundle. Commit the bundle (and `PLUG.md`) when publishing a release so users can install it from GitHub.

## Test

```bash
npm test
```

## Limitations

This plug supports a focused subset of Obsidian Bases syntax. The following syntax is not supported yet:

- Formula properties defined in `formulas`, including references through `formula.*`.
- Summary formulas defined in top-level `summaries`, view-level `summaries`, and the default summary aggregations such as `Average`, `Min`, `Max`, and `Sum`.
- View options other than a basic table's `filters`, `order`, and `columnSize`; this includes `limit`, `groupBy`, summary rows, and non-table view types.
- Filter and formula expression features beyond simple property comparisons, `file.hasTag(...)`, and `file.inFolder(...)`; this includes arithmetic operators, date arithmetic, inline boolean operators (`!`, `&&`, `||`), and built-in or plugin-provided functions such as `file.hasLink(...)`, `today()`, `now()`, `date(...)`, `link(...)`, and `list(...)`.
- Property access forms beyond direct note properties and the currently implemented file properties; this includes `this`, bracket notation such as `note["price"]`, nested object/list access, list indexes, and most file properties such as `file.backlinks`, `file.embeds`, `file.links`, `file.properties`, and `file.tags`.
- Bases-specific value types and rendering semantics for dates, durations, File objects, Link objects, and Wikilinks in frontmatter properties.

## Contributing

When adding, removing, or repurposing files in this plug, update `ARCHITECTURE.md` in the same change.
