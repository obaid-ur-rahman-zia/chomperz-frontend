import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imagePath = join(root, "public", "images", "chomper.jpg");
const outDir = join(root, "public", "icons");
const CHOMPER_BG = "#c9d0b6";

mkdirSync(outDir, { recursive: true });

const image = readFileSync(imagePath);

async function loadSharp() {
  const candidates = [
    join(root, "node_modules", "sharp"),
    join(root, "node_modules", "next", "node_modules", "sharp"),
  ];
  for (const base of candidates) {
    const entry = join(base, "lib", "index.js");
    if (!existsSync(entry)) continue;
    const mod = await import(pathToFileURL(entry).href);
    return mod.default;
  }
  throw new Error("sharp not found — run npm install in frontend");
}

const sharp = await loadSharp();

async function writeIcon(size, filename, options = {}) {
  let pipeline = sharp(image).resize(size, size, {
    fit: options.padding ? "contain" : "cover",
    position: "centre",
    background: CHOMPER_BG,
  });
  if (options.padding) {
    const pad = Math.round(size * options.padding);
    pipeline = pipeline.extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: CHOMPER_BG,
    });
  }
  await pipeline.png().toFile(join(outDir, filename));
  console.log(`Wrote icons/${filename} from public/images/chomper.jpg`);
}

await writeIcon(180, "icon-180.png");
await writeIcon(192, "icon-192.png");
await writeIcon(512, "icon-512.png");
await writeIcon(512, "icon-maskable-512.png", { padding: 0.12 });
