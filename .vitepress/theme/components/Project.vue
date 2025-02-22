<script setup lang="ts">
import type { Project } from '../types/project'

defineProps<{
  project: Project
}>()
</script>

<template>
  <div class="flex flex-col hover:bg-gray-500/10 px-4 py-1 group">
    <a :href="project.url" target="_blank" class="link">
      {{ project.name.split('-').map(word => word.charAt(0).toLocaleUpperCase() + word.slice(1)).join(' ') }}
    </a>
    <p class="text-sm opacity-50">
      {{ project.description }}
    </p>
  </div>
</template>
