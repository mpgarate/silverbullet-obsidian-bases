import { copyFile, mkdir } from "node:fs/promises";

const source = new URL("../obsidian-bases.plug.js", import.meta.url);
const targetDir = new URL("../../_plug/", import.meta.url);
const target = new URL("obsidian-bases.plug.js", targetDir);

await mkdir(targetDir, { recursive: true });
await copyFile(source, target);
