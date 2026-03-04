<script setup lang="ts">
import type { Header } from 'vitepress'

const { frontmatter, page } = useData()
const date = computed(() => frontmatter.value.date?.split('T')[0] || '')
const activeHeading = ref('')
let observer: IntersectionObserver | undefined

const headings = computed(() => {
  const list: Header[] = []

  function walk(items: Header[]) {
    items.forEach((item) => {
      list.push(item)
      if (item.children?.length)
        walk(item.children)
    })
  }

  walk(page.value.headers || [])
  return list
})

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

    if (visible)
      activeHeading.value = `#${visible.target.id}`
  }, { rootMargin: '-25% 0px -65% 0px', threshold: [0.2, 0.4, 0.8] })

  headings.value.forEach((item) => {
    const el = document.getElementById(item.slug)
    if (el)
      observer?.observe(el)
  })
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <article class="site-shell py-8 md:py-12">
    <div class="reader-grid">
      <aside class="hidden lg:block">
        <div class="sticky top-24 border-r border-(--color-border) pr-5">
          <p class="text-sm tracking-[0.1em] text-(--color-text-soft)">文章索引</p>
          <nav class="mt-3 flex max-h-[70vh] flex-col gap-2 overflow-auto pr-1 text-sm">
            <a
              v-for="item in headings"
              :key="item.slug"
              :href="`#${item.slug}`"
              class="transition"
              :class="activeHeading === `#${item.slug}` ? 'text-(--color-heading)' : 'text-(--color-text-soft) hover:text-(--color-heading)'"
            >
              {{ item.title }}
            </a>
          </nav>
        </div>
      </aside>

      <div>
        <header class="mb-8 border-b border-(--color-border) pb-6 font-family-anwt">
          <h1 class="text-3xl leading-tight text-(--color-heading) md:text-[2rem]">{{ frontmatter.title }}</h1>
          <p v-if="date" class="mt-3 text-xs tracking-[0.12em] text-(--color-text-soft)">{{ date }}</p>
        </header>

        <div class="content-shell">
          <Content class="prose prose-sm sm:prose-base dark:prose-invert" />
        </div>

        <div class="my-14 flex justify-center">
          <Button href="/blog">Back to Blog</Button>
        </div>
      </div>
    </div>
  </article>
</template>
