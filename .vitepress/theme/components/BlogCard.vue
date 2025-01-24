<script lang="ts" setup>
import type { ContentData } from 'vitepress'

defineProps<{
  post: ContentData
}>()
</script>

<template>
  <Button variant="default" class="flex! justify-start" :href="post.url" size="lg">
    <div>
      <h2 class="md:text-xl font-medium mb-4">
        {{ post.frontmatter.title }}
      </h2>

      <p class="text-sm opacity-50">
        {{ post.frontmatter.description }}
      </p>
    </div>
  </Button>
</template>
