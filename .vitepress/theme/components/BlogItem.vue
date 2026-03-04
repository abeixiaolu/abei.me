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
  <article class="group rounded-lg border border-transparent px-1 py-2 transition-colors hover:border-(--color-border)">
    <div class="flex items-center justify-between gap-3 min-w-0">
      <div class="flex min-w-0 items-center gap-2">
        <a :href="post.url" class="truncate text-[1.02rem] text-(--color-heading) decoration-(--color-border) underline-offset-4 transition-colors hover:text-(--color-primary)">
          {{ post.frontmatter.title }}
        </a>
        <IconTag v-if="post.frontmatter.series" class="shrink-0 text-xs uppercase" text="Series" />
      </div>
      <span class="shrink-0 text-xs tracking-[0.08em] text-(--color-text-soft)">
        {{ date }}
      </span>
    </div>
  </article>
</template>
