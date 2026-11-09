<script setup lang="ts">
import TerminalHeader from "../../components/TerminalHeader.vue";
import { data } from "../../../data/blog.data";

const newData = computed(() => {
  const groupedByYear: Map<number, any[]> = new Map();
  data.forEach((item) => {
    const year = new Date(item.frontmatter.date).getFullYear();
    if (!groupedByYear.has(year)) {
      groupedByYear.set(year, []);
    }
    groupedByYear.get(year)!.push(item);
  });
  return groupedByYear;
});
</script>

<template>
  <section class="terminal-page">
    <TerminalHeader
      command="ls ./notes"
      title="文字日志"
      description="关于代码、生活，以及尚未想明白的事。"
      :meta="`${data.length} FILES`"
    />

    <div v-for="[year, blogs] in newData" :key="year" class="year-section">
      <div class="year-label">
        <span>{{ year }}/</span
        ><span>{{ blogs.length }} {{ blogs.length === 1 ? "entry" : "entries" }}</span>
      </div>
      <div class="articles-list">
        <BlogItem v-for="blog in blogs" :key="blog.url" :post="blog" />
      </div>
    </div>

    <div class="back-btn">
      <Button href="/" size="md">cd ~ / 返回桌面</Button>
    </div>
  </section>
</template>

<style scoped>
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
