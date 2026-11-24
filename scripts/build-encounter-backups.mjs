import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [css, playerData, engine] = await Promise.all([
  readFile(join(root, "encounter.css"), "utf8"),
  readFile(join(root, "data/encounters-player.js"), "utf8"),
  readFile(join(root, "encounter.js"), "utf8")
]);

const context = { window: {} };
vm.runInNewContext(playerData, context);
const encounters = context.window.ECHOES_ENCOUNTERS?.encounters || [];
const escapeScript = (source) => source.replaceAll("</script", "<\\/script");
const outputDirectory = join(root, "encounters");
await mkdir(outputDirectory, { recursive: true });

for (const encounter of encounters) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="Standalone interactive encounter: ${encounter.title}">
  <title>${encounter.title} · Echoes of the Deep</title>
  <style>${css}</style>
</head>
<body>
  <div id="encounterRoot" class="encounter-shell" aria-live="polite"></div>
  <script>window.ECHOES_OFFLINE_DEFAULT_ID=${JSON.stringify(encounter.id)};</script>
  <script>${escapeScript(playerData)}</script>
  <script>${escapeScript(engine)}</script>
</body>
</html>`;
  await writeFile(join(outputDirectory, `${encounter.id}-player.html`), html, "utf8");
  console.log(`Built encounters/${encounter.id}-player.html`);
}
