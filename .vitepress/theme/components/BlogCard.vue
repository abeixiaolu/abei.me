<script lang="ts" setup>
import { ContentData } from 'vitepress'

defineProps<{
  post: ContentData
}>()
</script>

<template>
  <article
    class="group relative border-4 border-black bg-white p-4 shadow-[8px_8px_0_black] transition duration-150 ease-linear space-y-3 hover:shadow-[12px_12px_0_black] hover:-translate-x-1 hover:-translate-y-1">
    <h2 class="text-2xl font-medium">
      <a :href="post.url">
        {{ post.frontmatter.title }}
        <span class="absolute inset-0" />
      </a>
    </h2>

    <p>
      {{ post.frontmatter.description }}
    </p>
  </article>
</template>