import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

// Rebuild the real mesh silhouettes whenever the 2×2 alpha atlas changes.
const input = new URL('../../src/public/textures/pothos-atlas-v2.webp', import.meta.url);
const output = new URL('../../.vitepress/theme/scene/pothosContours.ts', import.meta.url);
const { data, info } = await sharp(input.pathname).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const width = info.width / 2;
const height = info.height / 2;
const contours = Array.from({ length: 4 }, (_, cell) => Array.from({ length: 65 }, (_, row) => {
  const v = row / 64;
  const y = Math.min(height - 1, Math.round((1 - v) * (height - 1))) + Math.floor(cell / 2) * height;
  let left = width - 1;
  let right = 0;
  for (let x = 0; x < width; x++) {
    if (data[(y * info.width + (cell % 2) * width + x) * 4 + 3] > 100) {
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
  }
  if (right < left) left = right = width / 2;
  return [v, Math.max(0, left - 1) / width, Math.min(width, right + 1) / width].map(value => +value.toFixed(5));
}));
await writeFile(output, `export default ${JSON.stringify(contours)} as const;\n`);
