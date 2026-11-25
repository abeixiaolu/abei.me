/**
 * 虚拟模块 virtual:site-content：扫描 src/content，构建期编译 Markdown。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin, ViteDevServer } from 'vite';
import matter from 'gray-matter';
import { z } from 'zod';

const VIRTUAL_ID = 'virtual:site-content';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

const postSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string().optional(),
  series: z.boolean().optional().default(false),
  hidden: z.boolean().optional().default(false),
});

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  caption: z.string().optional(),
  meta: z.string().optional(),
  lede: z.string().optional(),
});

type Project = {
  name: string;
  description: string;
  url?: string;
  repo?: string;
  live?: string;
};

type ProjectGroup = {
  title: string;
  projects: Project[];
};

async function walkMarkdown(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkMarkdown(full)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function toId(filePath: string, base: string) {
  return path
    .relative(base, filePath)
    .replace(/\\/g, '/')
    .replace(/\.md$/, '');
}

async function loadCollection(
  root: string,
  name: 'blog' | 'diary',
  renderMarkdown: (md: string) => Promise<string>,
) {
  const base = path.join(root, 'src/content', name);
  const files = await walkMarkdown(base);
  const posts = [];

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const { data, content } = matter(raw);
    const parsed = postSchema.parse(data);
    const id = toId(file, base);
    const html = await renderMarkdown(content);
    posts.push({
      id,
      title: parsed.title,
      description: parsed.description,
      date: parsed.date.toISOString(),
      category: parsed.category,
      series: parsed.series,
      hidden: parsed.hidden,
      html,
    });
  }

  return posts;
}

async function loadPage(
  root: string,
  slug: string,
  renderMarkdown: (md: string) => Promise<string>,
) {
  const file = path.join(root, 'src/content/pages', `${slug}.md`);
  const raw = await fs.readFile(file, 'utf8');
  const { data, content } = matter(raw);
  // 去掉旧 Astro layout 字段
  const { layout: _layout, groups, ...rest } = data as Record<string, unknown>;
  const parsed = pageSchema.parse(rest);
  const html = content.trim() ? await renderMarkdown(content) : '';
  return {
    slug,
    title: parsed.title,
    description: parsed.description,
    caption: parsed.caption,
    meta: parsed.meta,
    lede: parsed.lede,
    html,
    groups: (groups as ProjectGroup[] | undefined) ?? undefined,
  };
}

async function buildPayload(root: string) {
  // 带时间戳，避免 Node ESM 缓存导致 rehype / image-meta 改了仍跑旧代码
  const markdownUrl = `${pathToFileURL(path.join(root, 'src/lib/markdown.mjs')).href}?t=${Date.now()}`;
  const mod = await import(markdownUrl);
  const renderMarkdown = mod.renderMarkdown as (md: string) => Promise<string>;
  const [blog, diary, uses, projects] = await Promise.all([
    loadCollection(root, 'blog', renderMarkdown),
    loadCollection(root, 'diary', renderMarkdown),
    loadPage(root, 'uses', renderMarkdown),
    loadPage(root, 'projects', renderMarkdown),
  ]);

  return { blog, diary, pages: { uses, projects } };
}

export function contentPlugin(root = process.cwd()): Plugin {
  let server: ViteDevServer | undefined;
  let cache: string | undefined;

  async function loadModule() {
    if (cache) return cache;
    const payload = await buildPayload(root);
    cache = `export default ${JSON.stringify(payload)};\n`;
    return cache;
  }

  function invalidate() {
    cache = undefined;
    const mod = server?.moduleGraph.getModuleById(RESOLVED_ID);
    if (mod) {
      server!.moduleGraph.invalidateModule(mod);
      server!.ws.send({ type: 'full-reload' });
    }
  }

  return {
    name: 'site-content',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    async load(id) {
      if (id === RESOLVED_ID) return loadModule();
    },
    configureServer(devServer) {
      server = devServer;
      const contentDir = path.join(root, 'src/content');
      const markdownLib = path.join(root, 'src/lib');
      const imageMeta = path.join(root, 'src/data/image-meta.json');
      devServer.watcher.add(contentDir);
      devServer.watcher.add(markdownLib);
      devServer.watcher.add(imageMeta);
      devServer.watcher.on('all', (_event, file) => {
        if (
          file.includes(`${path.sep}src${path.sep}content${path.sep}`) ||
          file.includes(`${path.sep}src${path.sep}lib${path.sep}markdown.mjs`) ||
          file.includes(`${path.sep}src${path.sep}lib${path.sep}rehype-`) ||
          file.includes(`${path.sep}src${path.sep}lib${path.sep}image-meta.mjs`) ||
          file.includes(`${path.sep}src${path.sep}data${path.sep}image-meta.json`)
        ) {
          invalidate();
        }
      });
    },
    buildStart() {
      cache = undefined;
    },
  };
}
