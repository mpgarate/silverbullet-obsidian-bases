import { buildBaseSearchContent } from "./core.mjs";

const decoder = new TextDecoder();

export async function indexBaseDocument(event) {
  const meta = event?.meta ?? {};
  const path = meta.name ?? meta.path ?? "";
  if (!path.toLowerCase().endsWith(".base")) {
    return null;
  }

  const data = await syscall("space.readFile", path);
  const yamlText = typeof data === "string" ? data : decoder.decode(data);
  return {
    content: buildBaseSearchContent(path, yamlText),
    cacheMode: "session",
  };
}
