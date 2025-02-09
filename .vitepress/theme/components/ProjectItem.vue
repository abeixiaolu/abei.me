<script setup lang="ts">
import type { Project } from '../types/project'

defineProps<{
  project: Project
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-2 min-w-0 hover:bg-gray-500/10 px-4 py-1">
    <a :href="project.url" target="_blank" class="flex flex-col group">
      <span class="group-hover:underline after:content-['\2197'] after:text-[10px] after:font-bold after:mt-[6px] after:ml-1 underline-offset-4 group-hover:text-primary transition-all duration-200 ease-linear">
        {{ project.name.split('-').map(word => word.charAt(0).toLocaleUpperCase() + word.slice(1)).join(' ') }}
      </span>
      <span class="opacity-50">
        {{ project.description }}
      </span>
    </a>
  </div>
</template>
