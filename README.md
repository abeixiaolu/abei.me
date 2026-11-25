# abei.me

个人站点（Solid 2.0 + Tailwind v4 + filesystem-routing）。

## 开发

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # 输出 dist/client
pnpm serve    # 预览生产构建
```

### 本地图床管理

仅 `pnpm dev`（Vite 中间件）可用；开发时导航会出现 **Imgbed**，也可手动打开：

`http://localhost:3000/_imgbed/`

生产构建不包含该导航项，线上也无 API。

在项目根 `.env` 配置：

```bash
IMGBED_PASSWORD=your-password
GITHUB_TOKEN=ghp_...   # 已有 Typora 上传即可复用
```

支持批量上传 / 删除，并标出正文未引用的图片（对比 GitHub 图床与 `image-meta.json`）。

## 内容

- 日记 / 博客：`src/content/diary`、`src/content/blog`
- 胶片：`src/content/film`（一专辑一篇；正文 `![alt](url "胶片名")`）
- 静态页：`src/content/pages/{uses,projects}.md`
- 构建期经 `virtual:site-content` 编译为 HTML（remark / rehype / Shiki）

## 部署

Cloudflare Pages：构建命令 `pnpm build`，输出目录 `dist/client`。  
`public/_redirects`：仅 `/` → `/diary/`；深链靠 Pages 内置 SPA fallback（不要写 `/* /index.html 200`）。  
从 Astro SSG 迁过来后若线上仍像旧站，到 CF 控制台对该域名 **Purge Everything**（旧页曾带 `s-maxage=604800`）。
