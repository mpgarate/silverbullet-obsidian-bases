# SilverBullet Bases Plug

This plug registers `.base` files as SilverBullet document editor files, renders an Obsidian Bases table view, and exposes `.base` content to Silversearch via the `silversearch:index` event.

## Install

Add this plug to your SilverBullet `CONFIG.md` page:

````markdown
```space-lua
config.set {
  plugs = {
    "github:mpgarate/silverbullet-bases/silverbullet-bases.plug.js"
  }
}
```
````

Replace `mpgarate` with the GitHub account or organization that hosts this repository, then run `Plugs: Update` in SilverBullet.

## Build

```bash
npm install
npm run build
```

`npm run build` regenerates the iframe viewer script and compiles the distributable root-level `silverbullet-bases.plug.js` bundle.

Commit `silverbullet-bases.plug.js` when publishing a release or updating the plug for GitHub-based installation.

## Test

```bash
npm test
```

The first implementation supports the example base shape in this vault: table views, Markdown frontmatter properties, `file.name`, `file.ext`, `file.folder`, simple comparison filters, recursive `and`/`or`/`not`, and ordered columns.

## Maintenance

When adding, removing, or repurposing files in this plug, update `ARCHITECTURE.md` in the same change.

## Resources
- https://silverbullet.md/Plugs
- https://v2.silverbullet.md/Plugs/Development
- https://obsidian.md/help/bases/syntax
