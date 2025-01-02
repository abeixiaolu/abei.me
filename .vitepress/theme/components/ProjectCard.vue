<script lang="ts" setup>
import { Project } from '../types/project';


defineProps<{
  project: Project
}>()
</script>

<template>
  <article
    class="group relative border-4 border-black bg-white p-6 shadow-[8px_8px_0_black] transition duration-150 ease-linear space-y-4 hover:shadow-[12px_12px_0_black] hover:-translate-x-1 hover:-translate-y-1">
    <h2 class="text-2xl text-black font-medium">
      <a :href="project.url">
        {{ project.name }}
        <span class="absolute inset-0" />
      </a>
    </h2>

    <p v-if="project.description" class="text-lg text-black">
      {{ project.description }}
    </p>
  </article>
</template>