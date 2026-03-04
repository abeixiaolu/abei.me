<script setup lang="ts">
import { data } from '../../../data/blog.data'

const sections = ref<HTMLElement[]>([])
const activeYear = ref('')
let observer: IntersectionObserver | undefined

const groupedByYear = computed(() => {
  const groupedByYear: Map<number, any[]> = new Map()
  data.forEach((item) => {
    const year = new Date(item.frontmatter.date).getFullYear()
    if (!groupedByYear.has(year))
      groupedByYear.set(year, [])
    groupedByYear.get(year)!.push(item)
  })

  return new Map([...groupedByYear.entries()].sort((a, b) => b[0] - a[0]))
})

onMounted(() => {
  sections.value = Array.from(document.querySelectorAll('[data-year-section]')) as HTMLElement[]
  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

    if (visible)
      activeYear.value = visible.target.getAttribute('data-year-section') || ''
  }, { rootMargin: '-35% 0px -55% 0px', threshold: [0.2, 0.5, 0.8] })

  sections.value.forEach(section => observer?.observe(section))
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section class="site-shell py-8 md:py-12 font-family-anwt">
    <div class="reader-grid">
      <aside class="hidden lg:block">
        <div class="sticky top-24 border-r border-(--color-border) pr-5">
          <p class="text-sm tracking-[0.1em] text-(--color-text-soft)">文章年份</p>
          <nav class="mt-3 flex flex-col gap-2 text-sm">
            <a
              v-for="[year] in groupedByYear"
              :key="year"
              :href="`#year-${year}`"
              class="transition"
              :class="activeYear === String(year) ? 'text-(--color-heading)' : 'text-(--color-text-soft) hover:text-(--color-heading)'"
            >
              {{ year }}
            </a>
          </nav>
        </div>
      </aside>

      <div>
        <PageHeader />

        <div v-for="[year, blogs] in groupedByYear" :id="`year-${year}`" :key="year" :data-year-section="year" class="mb-10 scroll-mt-28">
          <StrokeLineText :text="year" />
          <div class="space-y-1">
            <BlogItem v-for="blog in blogs" :key="blog.url" :post="blog" />
          </div>
        </div>

        <div class="my-14 flex justify-center">
          <Button href="/" size="md">Back to Home</Button>
        </div>
      </div>
    </div>
  </section>
</template>
