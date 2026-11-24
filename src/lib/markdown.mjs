/**
 * 构建期 Markdown → HTML（与旧 Astro 管线对齐）
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { remarkAlert } from 'remark-github-blockquote-alert';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { createHighlighter } from 'shiki';
import { rehypeInlineCodeGap } from './rehype-inline-code-gap.mjs';
import { rehypeEnableTaskCheckboxes } from './rehype-enable-task-checkboxes.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const sereinLight = JSON.parse(
  readFileSync(join(here, '../themes/serein-light.json'), 'utf8'),
);
const sereinDark = JSON.parse(
  readFileSync(join(here, '../themes/serein-dark.json'), 'utf8'),
);

let highlighterPromise;

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [sereinLight, sereinDark],
      langs: [
        'javascript',
        'typescript',
        'tsx',
        'jsx',
        'json',
        'bash',
        'shell',
        'zsh',
        'html',
        'css',
        'markdown',
        'md',
        'yaml',
        'yml',
        'toml',
        'rust',
        'go',
        'python',
        'diff',
        'text',
        'plaintext',
        'nginx',
        'sql',
        'vue',
        'astro',
      ],
    });
  }
  return highlighterPromise;
}

/** @param {string} markdown */
export async function renderMarkdown(markdown) {
  const highlighter = await getHighlighter();
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkAlert)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeShikiFromHighlighter, highlighter, {
      themes: {
        light: sereinLight.name,
        dark: sereinDark.name,
      },
      defaultColor: false,
    })
    .use(rehypeInlineCodeGap)
    .use(rehypeEnableTaskCheckboxes)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
}
