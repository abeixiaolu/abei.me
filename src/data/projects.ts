export interface Project {
  name: string;
  description: string;
  url: string;
}

export interface ProjectGroup {
  title: string;
  projects: Project[];
}

export const projectGroups: ProjectGroup[] = [
  {
    title: "Personal",
    projects: [
      {
        name: "abei.me",
        description: "个人站点，博客与作品集。",
        url: "https://github.com/abeixiaolu/abei.me",
      },
    ],
  },
  {
    title: "Vscode Theme",
    projects: [
      {
        name: "xiaoluabei-vscode-theme",
        description: "个人 VS Code / Cursor 主题。",
        url: "https://github.com/abeixiaolu/xiaoluabei-vscode-theme",
      },
    ],
  },
  {
    title: "Learning",
    projects: [
      {
        name: "rustfinity",
        description: "Rust 练习与学习仓库。",
        url: "https://github.com/abeixiaolu/rustfinity",
      },
      {
        name: "nuxt-tutorial",
        description: "Nuxt 教程练习项目。",
        url: "https://github.com/abeixiaolu/nuxt-tutorial",
      },
      {
        name: "php-study",
        description: "PHP 学习笔记与示例。",
        url: "https://github.com/abeixiaolu/php-study",
      },
      {
        name: "pixel-position",
        description: "像素风职位板练习项目。",
        url: "https://github.com/abeixiaolu/pixel-position",
      },
      {
        name: "random-emoji",
        description: "随机 emoji 小工具。",
        url: "https://github.com/abeixiaolu/random-emoji",
      },
    ],
  },
];
