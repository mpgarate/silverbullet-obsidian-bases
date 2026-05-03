---
name: Library/mpgarate/silverbullet-bases/PLUG
tags: meta/library
files:
- silverbullet-bases.plug.js
---

# silverbullet-bases

Registers `.base` files as a SilverBullet document editor and renders an Obsidian Bases table view. Also exposes `.base` content to the Silversearch plug via the `silversearch:index` event.

## Features

- Table view for `.base` files with Markdown frontmatter properties and the `file.name`, `file.ext`, `file.folder` virtual properties.
- Filters: simple comparison expressions (`==`, `!=`, `<`, `<=`, `>`, `>=`) and recursive `and` / `or` / `not` blocks.
- Ordered columns with display-name overrides and persisted column widths.
- Click-to-sort column headers (ascending → descending → unsorted).
- In-place cell editing for note frontmatter properties.
- "Add entry" button that creates a new note with frontmatter pre-populated from the base's equality filters.
