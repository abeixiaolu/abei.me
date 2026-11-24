import type { ParentProps } from 'solid-js';
import { HydrationScript } from '@solidjs/web';

/** HTML 文档壳；client 模式下预渲染时会去掉 hydration 脚本 */
export default function Document(props: ParentProps) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="阿北的个人站点" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link
          rel="preload"
          href="/fonts/BerkeleyMonoVariable.ttf"
          as="font"
          type="font/ttf"
          crossorigin=""
        />
        <link
          rel="preload"
          href="/fonts/SarasaGothicSC-Regular.woff2"
          as="font"
          type="font/woff2"
          crossorigin=""
        />
        <link
          rel="preload"
          href="/fonts/SarasaGothicSC-SemiBold.woff2"
          as="font"
          type="font/woff2"
          crossorigin=""
        />
        <title>abei</title>
        <HydrationScript />
      </head>
      <body class="min-h-dvh">{props.children}</body>
    </html>
  );
}
