<script lang="ts" setup>
import type { ContentData } from 'vitepress'

const props = defineProps<{
  post: ContentData
}>()

const date = computed(() =>
  props.post.frontmatter.date.split('T')[0].split('-').slice(1).join('-'),
)
</script>

<template>
  <div class="article-item">
    <span class="article-date">{{ date }}</span>
    <a :href="post.url" class="article-title">
      {{ post.frontmatter.title }}
    </a>
    <span v-if="post.frontmatter.series" class="article-tag">系列</span>
  </div>
</template>

<style scoped>
.article-item {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-hairline);
}

.article-date {
  font-family: var(--font-mono, monospace);
  font-size: 0.65rem;
  color: var(--color-text);
  opacity: 0.4;
  flex-shrink: 0;
  letter-spacing: 0.05rem;
}

.article-title {
  flex: 1;
  font-size: 0.95rem;
  letter-spacing: 0.05rem;
  text-decoration: none;
  color: var(--color-text);
  transition: color 0.2s;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-title:hover {
  color: var(--color-accent);
}

.article-tag {
  font-family: var(--font-mono, monospace);
  font-size: 0.6rem;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  padding: 0.1rem 0.4rem;
  flex-shrink: 0;
  opacity: 0.7;
}
</style>
