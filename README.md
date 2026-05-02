# SilverBullet Obsidian Bases Plug

This plug registers `.base` files as SilverBullet document editor files and renders an Obsidian Bases table view.

## Build

```bash
npm install
npm run build
```

`npm run build` regenerates the iframe viewer script, compiles `obsidian-bases.plug.js`, and copies it to `../_plug/obsidian-bases.plug.js`.

## Test

```bash
npm test
```

The first implementation supports the example base shape in this vault: table views, Markdown frontmatter properties, `file.name`, `file.ext`, `file.folder`, simple comparison filters, recursive `and`/`or`/`not`, and ordered columns.

## Maintenance

When adding, removing, or repurposing files in this plug, update `ARCHITECTURE.md` in the same change.

## Resources
- https://silverbullet.md/Plugs
- https://obsidian.md/help/bases/syntax
