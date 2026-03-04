<script setup lang="ts">
import { data } from '../../../data/blog.data'

const newData = computed(() => {
  const groupedByYear: Map<number, any[]> = new Map()
  data.forEach((item) => {
    const year = new Date(item.frontmatter.date).getFullYear()
    if (!groupedByYear.has(year)) {
      groupedByYear.set(year, [])
    }
    groupedByYear.get(year)!.push(item)
  })

  return new Map([...groupedByYear.entries()].sort((a, b) => b[0] - a[0]))
})
</script>

<template>
  <section class="site-shell space-y-10 py-8 font-family-anwt md:space-y-14">
    <PageHeader />

    <div v-for="[year, blogs] in newData" :key="year">
      <StrokeLineText :text="year" />
      <div class="space-y-1">
        <BlogItem v-for="blog in blogs" :key="blog.url" :post="blog" />
      </div>
    </div>

    <div class="my-14 flex justify-center">
      <Button href="/" size="md">
        Back to Home
      </Button>
    </div>
  </section>
</template>
