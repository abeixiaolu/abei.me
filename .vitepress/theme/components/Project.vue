<script setup lang="ts">
import type { Project } from "../types/project";

defineProps<{
  project: Project;
}>();
</script>

<template>
  <div class="terminal-project">
    <a :href="project.url" target="_blank" class="link">
      {{
        project.name
          .split("-")
          .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
          .join(" ")
      }}
    </a>
    <p class="project-description">
      {{ project.description }}
    </p>
  </div>
</template>
