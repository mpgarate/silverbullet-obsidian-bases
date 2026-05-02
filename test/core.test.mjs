import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildTableModel,
  makeRowFromFile,
  parseMarkdownFrontmatter,
  parseYaml,
} from "../src/core.mjs";

const musicBase = `views:
  - type: table
    name: Albums
    filters:
      and:
        - file.folder == "Music/Artists"
        - file.ext == "md"
    order:
      - file.name
      - artist
      - primary genre
      - instruments
      - release year
      - label
      - favorite track
    columnSize:
      note.artist: 220
`;

const musicNotes = {
  "Music/Artists/nina-simone.md": `---
artist: Nina Simone
primary genre: Jazz
instruments:
  - piano
  - vocals
release year: "1965"
label: Philips
favorite track: Feeling Good
---
Generated musician fixture.
`,
  "Music/Artists/fela-kuti.md": `---
artist: Fela Kuti
primary genre: Afrobeat
instruments:
  - saxophone
  - keyboards
release year: "1973"
label: EMI
favorite track: Gentleman
---
Generated musician fixture.
`,
  "Music/Artists/bjork.md": `---
artist: Bjork
primary genre: Art pop
instruments:
  - vocals
  - sampler
release year: "1997"
label: One Little Independent
favorite track: Joga
---
Generated musician fixture.
`,
  "Music/Drafts/aphex-twin.md": `---
artist: Aphex Twin
primary genre: Electronic
instruments:
  - synthesizer
release year: "1992"
label: R&S
favorite track: Xtal
---
Generated musician fixture outside the base folder.
`,
};

test("parses the generated music base table view", () => {
  const base = parseYaml(musicBase);

  assert.equal(base.views[0].type, "table");
  assert.equal(base.views[0].filters.and[0], 'file.folder == "Music/Artists"');
  assert.deepEqual(base.views[0].order.slice(0, 4), [
    "file.name",
    "artist",
    "primary genre",
    "instruments",
  ]);
  assert.equal(base.views[0].columnSize["note.artist"], 220);
});

test("extracts generated musician frontmatter keys with spaces and lists", () => {
  const frontmatter = parseMarkdownFrontmatter(musicNotes["Music/Artists/nina-simone.md"]);

  assert.equal(frontmatter["primary genre"], "Jazz");
  assert.deepEqual(frontmatter.instruments, ["piano", "vocals"]);
});

test("builds rows matching generated music folder and extension filters", () => {
  const rows = Object.entries(musicNotes).map(([path, markdown]) => {
    return makeRowFromFile({ name: path }, markdown);
  });

  const model = buildTableModel(parseYaml(musicBase), rows);

  assert.equal(model.rows.length, 3);
  assert.equal(model.columns[0].label, "Name");
  assert.equal(model.columns[2].property, "primary genre");
  assert.equal(model.columns[3].property, "instruments");
  assert.deepEqual(model.rows.map((row) => row.cells[0]).sort(), [
    "bjork",
    "fela-kuti",
    "nina-simone",
  ]);
  assert.equal(
    model.rows.find((row) => row.cells[0] === "nina-simone").cells[3],
    "piano, vocals",
  );
  assert.deepEqual(model.warnings, []);
});

test("unsupported filters fail closed with a warning", () => {
  const model = buildTableModel({
    views: [{
      type: "table",
      filters: "file.hasTag(\"computer-device\")",
      order: ["file.name"],
    }],
  }, [makeRowFromFile({ name: "Example.md" }, "---\ntags:\n  - computer-device\n---\n")]);

  assert.equal(model.rows.length, 0);
  assert.match(model.warnings[0], /Unsupported filter expression/);
});
