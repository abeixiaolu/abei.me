import type { ContentData } from 'vitepress'
import { createContentLoader } from 'vitepress'

declare const data: ContentData[]
export { data }

export default createContentLoader('demo/**/*.md', {
  transform(data) {
    // 按日期排序
    return data.sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime()
          - new Date(a.frontmatter.date).getTime(),
    )
  },
})
