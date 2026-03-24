<script setup lang="ts">
const { frontmatter } = useData()
</script>

<template>
  <section class="font-family-anwt">
    <div class="page-meta-header">
      <span>ARCHIVE // USES</span>
      <span>{{ new Date().getFullYear() }}</span>
    </div>
    <Content class="prose dark:prose-invert" />
  </section>
</template>

<style scoped>
.page-meta-header {
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
</style>
