<script setup lang="ts">
import { data } from '../../../data/blog.data'

const newData = computed(() => {
  // 根据年份分组
  const groupedByYear: Map<number, any[]> = new Map()
  data.forEach((item) => {
    const year = new Date(item.frontmatter.date).getFullYear()
    if (!groupedByYear.has(year)) {
      groupedByYear.set(year, [])
    }
    groupedByYear.get(year)!.push(item)
  })
  return groupedByYear
})
</script>

<template>
  <section class="space-y-8 md:space-y-16 font-family-anwt">
    <PageHeader />

    <div v-for="[year, blogs] in newData" :key="year" class="mt-4">
      <StrokeLineText :text="year" />
      <div class="space-y-4">
        <BlogItem v-for="blog in blogs" :key="blog.url" :post="blog" />
      </div>
    </div>

    <div class="flex justify-center">
      <Button href="/" size="md">
        Back to Home
      </Button>
    </div>
  </section>
</template>
