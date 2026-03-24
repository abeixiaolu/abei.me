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
  return groupedByYear
})
</script>

<template>
  <section class="font-family-anwt">
    <div class="blog-meta-header">
      <span>ARCHIVE // BLOG</span>
      <span>{{ new Date().getFullYear() }}</span>
    </div>

    <div v-for="[year, blogs] in newData" :key="year" class="year-section">
      <div class="year-label">{{ year }}</div>
      <div class="articles-list">
        <BlogItem v-for="blog in blogs" :key="blog.url" :post="blog" />
      </div>
    </div>

    <div class="back-btn">
      <Button href="/" size="md">Back to Home</Button>
    </div>
  </section>
</template>

<style scoped>
.blog-meta-header {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  color: var(--color-text);
  opacity: 0.45;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  border-bottom: 1px solid var(--color-hairline);
  padding-bottom: 0.75rem;
  margin-bottom: 2.5rem;
}

.year-section {
  margin-bottom: 3rem;
}

.year-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  letter-spacing: 0.2rem;
  color: var(--color-text);
  opacity: 0.35;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.back-btn {
  display: flex;
  justify-content: center;
  margin: 3rem 0;
}
</style>
