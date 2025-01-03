import { dirname, join } from "node:path";
import fs from "fs-extra";
import sharp from "sharp";
const ogSvg = fs.readFileSync(join(".vitepress", "og-template.svg"), "utf-8");

export async function genOg(title: string, output: string) {
  if (fs.existsSync(output)) {
    return;
  }

  await fs.mkdir(dirname(output), { recursive: true });

  const lines = title
    .trim()
    .split(/(.{0,30})(?:\s|$)/g)
    .filter(Boolean);

  const data: Record<string, string> = {
    line1: lines[0],
    line2: lines[1],
    line3: lines[2],
  };
  console.log("data: ", data);
  const svg = ogSvg.replace(
    /\{\{([^}]+)\}\}/g,
    (_, name) => data[name] || "\n",
  );

  // console.info(`Generating ${output}`);

  try {
    await sharp(Buffer.from(svg)).resize(1440, 810).png().toFile(output);
  } catch (e) {
    console.error("Failed to generate og image", e);
  }
}
