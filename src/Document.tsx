import type { ParentProps } from 'solid-js';
import { HydrationScript } from '@solidjs/web';
import { absoluteUrl, site } from './lib/site';

const ogImage = absoluteUrl(site.ogImage);

/** HTML 文档壳；client 模式下预渲染时会去掉 hydration 脚本 */
export default function Document(props: ParentProps) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={site.description} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="canonical" href={`${site.origin}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={site.name} />
        <meta property="og:locale" content="zh_CN" />
        <meta property="og:title" content={site.name} />
        <meta property="og:description" content={site.description} />
        <meta property="og:url" content={`${site.origin}/`} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={site.name} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={site.name} />
        <meta name="twitter:description" content={site.description} />
        <meta name="twitter:image" content={ogImage} />
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
