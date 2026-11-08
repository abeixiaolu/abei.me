<script lang="ts" setup>
import { data } from "../../data/github-projects.data";
</script>

<template>
  <section class="font-family-anwt">
    <div class="page-meta-header">
      <span>ARCHIVE // PROJECT</span>
      <span>{{ new Date().getFullYear() }}</span>
    </div>
    <p v-if="!data.length" class="project-empty">这里还没有收录项目。你可以到 <a class="link" href="https://github.com/abeixiaolu" target="_blank" rel="noopener noreferrer">GitHub</a> 看看，或打开其他应用。</p>
    <div class="space-y-10">
      <div v-for="section in data" :key="section.title">
        <StrokeLineText size="sm" :text="section.title" />
        <section class="space-y-4 pl-4 pt-2">
          <Project v-for="project in section.projects" :key="project.url" :project />
        </section>
      </div>
    </div>

    <div class="back-btn">
      <Button href="/" size="md">Back to Home</Button>
    </div>
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

.back-btn {
  display: flex;
  justify-content: center;
  margin: 3rem 0;
}
</style>
