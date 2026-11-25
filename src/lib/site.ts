/** 站点绝对地址与默认 SEO；分享卡片依赖绝对 URL */
export const site = {
  origin: 'https://abei.me',
  name: 'abei',
  description: '阿北的个人站点',
  ogImage: '/og.png',
} as const;

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${site.origin}${normalized}`;
}

export function canonicalPath(path: string) {
  if (!path || path === '/') return '/';
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}
