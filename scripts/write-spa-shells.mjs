/**
 * 构建后把 SPA index.html 复制到各内容路径，覆盖 CF 自定义域名上残留的旧 SSG HTML。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist/client');

async function walkMarkdown(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkMarkdown(full)));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function toId(filePath, base) {
  return path.relative(base, filePath).replace(/\\/g, '/').replace(/\.md$/, '');
}

async function writeShell(routeDir, shell) {
  const dir = path.join(outDir, routeDir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), shell, 'utf8');
}

const shell = await fs.readFile(path.join(outDir, 'index.html'), 'utf8');
const routes = new Set(['diary', 'blog', 'projects', 'uses']);

for (const name of ['blog', 'diary']) {
  const base = path.join(root, 'src/content', name);
  for (const file of await walkMarkdown(base)) {
    routes.add(`${name}/${toId(file, base)}`);
  }
}

await Promise.all([...routes].map((route) => writeShell(route, shell)));
console.log(`[spa-shells] wrote ${routes.size} route shells → dist/client`);
