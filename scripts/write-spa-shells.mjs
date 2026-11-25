/**
 * 构建后把 SPA index.html 复制到各内容路径，并写入该页的 title / OG meta，
 * 让微信 / Slack / iMessage 等不执行 JS 的爬虫也能拿到分享卡片。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist/client');
const SITE_ORIGIN = 'https://abei.me';
const DEFAULT_DESCRIPTION = '阿北的个人站点';
const OG_IMAGE = `${SITE_ORIGIN}/og.png`;

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

function pageTitle(title) {
  return title === 'abei' ? 'abei' : `${title} · abei`;
}

function escAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setMetaByName(html, name, content) {
  const re = new RegExp(
    `<meta(\\s+)name="${name}"(\\s+)content="[^"]*"`,
    'i',
  );
  if (re.test(html)) {
    return html.replace(re, `<meta$1name="${name}"$2content="${escAttr(content)}"`);
  }
  return html.replace(
    /<\/head>/i,
    `<meta name="${name}" content="${escAttr(content)}"></head>`,
  );
}

function setMetaByProperty(html, property, content) {
  const re = new RegExp(
    `<meta(\\s+)property="${property}"(\\s+)content="[^"]*"`,
    'i',
  );
  if (re.test(html)) {
    return html.replace(
      re,
      `<meta$1property="${property}"$2content="${escAttr(content)}"`,
    );
  }
  return html.replace(
    /<\/head>/i,
    `<meta property="${property}" content="${escAttr(content)}"></head>`,
  );
}

function applySeo(html, seo) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escAttr(seo.title)}</title>`);
  out = setMetaByName(out, 'description', seo.description);
  out = out.replace(
    /<link(\s+)rel="canonical"(\s+)href="[^"]*"/i,
    `<link$1rel="canonical"$2href="${escAttr(seo.url)}"`,
  );
  if (!/<link[^>]*rel="canonical"/i.test(out)) {
    out = out.replace(
      /<\/head>/i,
      `<link rel="canonical" href="${escAttr(seo.url)}"></head>`,
    );
  }
  out = setMetaByProperty(out, 'og:type', seo.type);
  out = setMetaByProperty(out, 'og:title', seo.title);
  out = setMetaByProperty(out, 'og:description', seo.description);
  out = setMetaByProperty(out, 'og:url', seo.url);
  out = setMetaByProperty(out, 'og:image', seo.image);
  out = setMetaByProperty(out, 'og:image:alt', seo.title);
  out = setMetaByName(out, 'twitter:title', seo.title);
  out = setMetaByName(out, 'twitter:description', seo.description);
  out = setMetaByName(out, 'twitter:image', seo.image);
  return out;
}

async function writeShell(routeDir, shell) {
  const dir = path.join(outDir, routeDir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), shell, 'utf8');
}

function routeSeo(route, title, description, type = 'website') {
  const pathPart = route ? `/${route}/` : '/';
  return {
    title: pageTitle(title),
    description: description?.trim() || DEFAULT_DESCRIPTION,
    url: `${SITE_ORIGIN}${pathPart}`,
    image: OG_IMAGE,
    type,
  };
}

const baseShell = await fs.readFile(path.join(outDir, 'index.html'), 'utf8');

/** @type {Map<string, { title: string, description?: string, type?: string }>} */
const routes = new Map([
  ['', { title: 'abei', description: DEFAULT_DESCRIPTION }],
  ['diary', { title: 'Diary', description: 'Field notes and daily logs.' }],
  ['blog', { title: 'Blog', description: 'Notes, tutorials, and asides.' }],
  ['projects', { title: 'Project', description: 'Open source and personal work.' }],
  ['uses', { title: 'Use', description: 'Tools and gear I use daily.' }],
]);

for (const name of ['blog', 'diary']) {
  const base = path.join(root, 'src/content', name);
  for (const file of await walkMarkdown(base)) {
    const raw = await fs.readFile(file, 'utf8');
    const { data } = matter(raw);
    const id = toId(file, base);
    routes.set(`${name}/${id}`, {
      title: data.title || id,
      description: data.description || DEFAULT_DESCRIPTION,
      type: 'article',
    });
  }
}

// 静态页 frontmatter 覆盖列表描述
for (const slug of ['projects', 'uses']) {
  const file = path.join(root, 'src/content/pages', `${slug}.md`);
  try {
    const raw = await fs.readFile(file, 'utf8');
    const { data } = matter(raw);
    routes.set(slug, {
      title: data.title || slug,
      description: data.description || routes.get(slug)?.description,
    });
  } catch {
    /* keep defaults */
  }
}

await Promise.all(
  [...routes.entries()].map(([route, meta]) => {
    const seo = routeSeo(route, meta.title, meta.description, meta.type);
    const shell = applySeo(baseShell, seo);
    if (!route) {
      return fs.writeFile(path.join(outDir, 'index.html'), shell, 'utf8');
    }
    return writeShell(route, shell);
  }),
);

console.log(`[spa-shells] wrote ${routes.size} route shells with OG meta → dist/client`);
