import type { ContentData } from 'vitepress'
import { createContentLoader } from 'vitepress'

interface ContentDataWithChildren extends ContentData {
  children?: ContentData[]
}
declare const data: ContentDataWithChildren[]
export { data }

export default createContentLoader('blog/**/*.md', {
  transform(data: ContentDataWithChildren[]) {
    // 系列：一系列文章的集合
    const removedUrls: string[] = []
    data.filter(item => item.frontmatter.series).forEach((item) => {
      item.children = data.filter((subItem) => {
        if (subItem.url.includes(item.url) && item.url !== subItem.url) {
          removedUrls.push(subItem.url)
          return true
        }
        return false
      })
    })

    // 按日期排序
    return data.sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime()
          - new Date(a.frontmatter.date).getTime(),
    ).filter(item => !item.frontmatter.hidden && !removedUrls.includes(item.url))
  },
})
