<script setup lang="ts">
import { computed } from "vue";
import type { ContentData } from "vitepress";
const props = defineProps<{ post: ContentData }>();
const date = computed(() => String(props.post.frontmatter.date).slice(5, 10).replace("-", "."));
</script>

<template>
  <a :href="post.url" class="pixel-article-row">
    <i
      :class="
        post.frontmatter.category === '随笔' ? 'i-pixelarticons-bookmark' : 'i-pixelarticons-notes'
      "
      aria-hidden="true"
    ></i>
    <span class="article-title">{{ post.frontmatter.title }}</span>
    <span class="article-category">{{ post.frontmatter.category }}</span>
    <time :datetime="post.frontmatter.date">{{ date }}</time>
    <i class="i-pixelarticons-arrow-right article-arrow" aria-hidden="true"></i>
  </a>
</template>
