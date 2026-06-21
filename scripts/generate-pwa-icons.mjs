import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public", "chomper.svg");
const outDir = join(root, "public", "icons");

mkdirSync(outDir, { recursive: true });

const svg = readFileSync(svgPath);
const sharpModule = await import(
  pathToFileURL(join(root, "node_modules/next/node_modules/sharp/lib/index.js")).href
);
const sharp = sharpModule.default;

async function writeIcon(size, filename, options = {}) {
  let pipeline = sharp(svg).resize(size, size, { fit: "contain", background: "#141514" });
  if (options.padding) {
    const pad = Math.round(size * options.padding);
    pipeline = pipeline.extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: "#141514",
    });
  }
  await pipeline.png().toFile(join(outDir, filename));
  console.log(`Wrote icons/${filename}`);
}

await writeIcon(180, "icon-180.png");
await writeIcon(192, "icon-192.png");
await writeIcon(512, "icon-512.png");
await writeIcon(512, "icon-maskable-512.png", { padding: 0.12 });
