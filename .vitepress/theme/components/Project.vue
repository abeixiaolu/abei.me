<script setup lang="ts">
import type { Project } from '../types/project'

defineProps<{
  project: Project
}>()
</script>

<template>
  <article class="group rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-3 transition-colors hover:bg-(--color-primary-hover)">
    <a :href="project.url" target="_blank" class="link">
      {{ project.name.split('-').map(word => word.charAt(0).toLocaleUpperCase() + word.slice(1)).join(' ') }}
    </a>
    <p class="mt-2 text-sm leading-6 text-(--color-text-soft)">
      {{ project.description }}
    </p>
  </article>
</template>
