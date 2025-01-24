<script lang="ts" setup>
import type { Project } from '../types/project'

defineProps<{
  project: Project
}>()
</script>

<template>
  <Button :smooth="false" variant="default" class="flex! justify-start" :href="project.url" size="lg">
    <div>
      <h2 class="md:text-xl font-medium mb-4">
        <a :href="project.url">
          {{ project.name }}
          <span class="absolute inset-0" />
        </a>
      </h2>

      <p v-if="project.description" class="text-sm opacity-50">
        {{ project.description }}
      </p>
    </div>
  </Button>
</template>
