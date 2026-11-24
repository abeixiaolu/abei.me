import siteContent from 'virtual:site-content';

export type Post = {
  id: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
  series: boolean;
  hidden: boolean;
  html: string;
};

export type Project = {
  name: string;
  description: string;
  url?: string;
  repo?: string;
  live?: string;
};

export type ProjectGroup = {
  title: string;
  projects: Project[];
};

export type SitePage = {
  slug: string;
  title: string;
  description?: string;
  caption?: string;
  meta?: string;
  lede?: string;
  html: string;
  groups?: ProjectGroup[];
};

export type SiteContent = {
  blog: Post[];
  diary: Post[];
  pages: {
    uses: SitePage;
    projects: SitePage;
  };
};

export const content = siteContent as SiteContent;

/** 列表过滤：隐藏 hidden，系列子文归入系列根 */
export function listPosts(posts: Post[]) {
  const seriesRoots = new Set(
    posts
      .filter((post) => post.series)
      .map((post) => post.id.replace(/\/index$/, '')),
  );

  return posts
    .filter((post) => !post.hidden)
    .filter((post) => {
      const root = post.id.split('/')[0];
      return !(post.id.includes('/') && seriesRoots.has(root));
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getPost(posts: Post[], id: string) {
  return posts.find((post) => post.id === id);
}

export function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function padIndex(n: number) {
  return String(n).padStart(2, '0');
}
