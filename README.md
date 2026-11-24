# abei.me

个人站点（Solid 2.0 + Tailwind v4 + filesystem-routing）。

## 开发

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # 输出 dist/client
pnpm serve    # 预览生产构建
```

## 内容

- 日记 / 博客：`src/content/diary`、`src/content/blog`
- 静态页：`src/content/pages/{uses,projects}.md`
- 构建期经 `virtual:site-content` 编译为 HTML（remark / rehype / Shiki）

## 部署

Cloudflare Pages：构建命令 `pnpm build`，输出目录 `dist/client`。  
`public/_redirects`：`/` → `/diary/`，其余 SPA fallback 到 `index.html`。
