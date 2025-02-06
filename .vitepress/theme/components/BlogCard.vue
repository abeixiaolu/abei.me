<script lang="ts" setup>
import type { ContentData } from 'vitepress'

defineProps<{
  post: ContentData
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-2 min-w-0">
    <a :href="post.url" class="truncate hover:underline underline-offset-4 hover:text-primary transition-all duration-200 ease-linear">
      {{ post.frontmatter.title }}
    </a>
    <span class="text-sm text-[#888A]">
      {{ post.frontmatter.date.split('T')[0] }}
    </span>
  </div>
</template>
