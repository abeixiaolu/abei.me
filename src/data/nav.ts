export const navItems = [
  { href: "/diary/", label: "Diary" },
  { href: "/blog/", label: "Blog" },
  { href: "/film/", label: "Film" },
  { href: "/projects/", label: "Project" },
  { href: "/uses/", label: "Use" },
] as const;

export type NavItem = { href: string; label: string };

/** 本地开发额外露出图床管理入口；生产构建不包含 */
export function visibleNavItems(): NavItem[] {
  const items: NavItem[] = [...navItems];
  if (import.meta.env.DEV) {
    items.push({ href: "/_imgbed/", label: "Imgbed" });
  }
  return items;
}

/** 去掉末尾斜杠再比，兼容 /diary 与 /diary/ */
export function isNavActive(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  const base = href.replace(/\/$/, "") || "/";
  return path === base || path.startsWith(`${base}/`);
}
