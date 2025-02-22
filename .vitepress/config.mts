import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import MarkdownItGithubAlerts from 'markdown-it-github-alerts'
import { joinURL, withoutTrailingSlash } from 'ufo'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vitepress'
import { genOg } from './genOg'
import darkTheme from './theme/vscode/Xiaolu Abei Dark Soft-color-theme.json'
import lightTheme from './theme/vscode/Xiaolu Abei Light-color-theme.json'

const currentDir = dirname(fileURLToPath(import.meta.url))
const componentsDir = join(currentDir, 'theme/components')
const demoDir = join(currentDir, '../src/demo')
const pagesDir = join(currentDir, 'theme/pages')
const composablesDir = join(currentDir, 'theme/composables')
const utilsDir = join(currentDir, 'theme/utils')
const stylesDir = join(currentDir, 'theme/styles')

export default defineConfig({
  cleanUrls: true,
  lang: 'zh-CN',
  title: 'Artsmp\'s Blog',
  description: 'A blog about study and life',
  sitemap: { hostname: 'https://artsmp-me.pages.dev' },
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'twitter:site', content: '@abei557832' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:type', content: 'image/png' }],
    ['meta', { property: 'og:site_name', content: 'Artsmp' }],
    ['meta', { property: 'og:type', content: 'website' }],
  ],
  srcDir: 'src',
  vite: {
    plugins: [
      {
        name: 'watcher',
        configureServer(server) {
          server.watcher.add([
            componentsDir,
            pagesDir,
            demoDir,
            stylesDir,
            composablesDir,
            utilsDir,
          ])
        },
      },
      Components({
        dirs: [componentsDir, pagesDir, demoDir],
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        dts: join(currentDir, 'components.d.ts'),
      }),
      AutoImport({
        imports: ['vue', 'vitepress'],
        dirs: [composablesDir, utilsDir],
        dts: join(currentDir, 'auto-imports.d.ts'),
      }),
      tailwindcss(),
    ],
  },
  markdown: {
    theme: { light: lightTheme, dark: darkTheme },
    config(md) {
      md.use(MarkdownItGithubAlerts)
    },
    gfmAlerts: false,
  },
  async transformPageData(pageData, { siteConfig }) {
    // Set layout for blog articles
    if (pageData.filePath.startsWith('blog/')) {
      pageData.frontmatter.layout = 'blog-show'
    }
    pageData.frontmatter.head ??= []
    const title
      = pageData.frontmatter.title || pageData.title || siteConfig.site.title
    const description
      = pageData.frontmatter.description
      || pageData.description
      || siteConfig.site.description
    pageData.frontmatter.head.push(
      [
        'meta',
        {
          name: 'og:title',
          content: title,
        },
      ],
      [
        'meta',
        {
          name: 'twitter:title',
          content: title,
        },
      ],
      [
        'meta',
        {
          property: 'og:description',
          content: description,
        },
      ],
      [
        'meta',
        {
          name: 'twitter:description',
          content: description,
        },
      ],
    )

    // Create the canonical URL
    pageData.frontmatter.head.push([
      'link',
      {
        rel: 'canonical',
        href: joinURL(
          'https://artsmp-me.pages.dev',
          withoutTrailingSlash(pageData.filePath.replace(/(index)?\.md$/, '')),
        ),
      },
    ])

    pageData.frontmatter.head.push([
      'meta',
      {
        property: 'og:url',
        content: joinURL(
          'https://artsmp-me.pages.dev',
          withoutTrailingSlash(pageData.filePath.replace(/(index)?\.md$/, '')),
        ),
      },
    ])

    const ogName = pageData.filePath
      .replaceAll(/\//g, '-')
      .replace(/\.md$/, '.png')

    await genOg(
      pageData.frontmatter.title || pageData.title || siteConfig.site.title,
      joinURL(siteConfig.srcDir, 'public', 'og', ogName),
    )

    // Integrate OG image URL into frontmatter
    pageData.frontmatter.head.push(
      [
        'meta',
        {
          property: 'og:image',
          content: joinURL('https://artsmp-me.pages.dev', 'og', ogName),
        },
      ],
      [
        'meta',
        {
          name: 'twitter:image',
          content: joinURL('https://artsmp-me.pages.dev', 'og', ogName),
        },
      ],
    )
  },
})
