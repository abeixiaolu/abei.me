export const navItems = [
  { href: "/diary/", label: "Diary" },
  { href: "/blog/", label: "Blog" },
  { href: "/projects/", label: "Project" },
  { href: "/uses/", label: "Use" },
] as const;

/** 去掉末尾斜杠再比，兼容 /diary 与 /diary/ */
export function isNavActive(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  const base = href.replace(/\/$/, "") || "/";
  return path === base || path.startsWith(`${base}/`);
}
