<script lang="ts" setup>
import { data } from '../../../data/github-projects.data'

const { frontmatter } = useData()
</script>

<template>
  <section class="space-y-16">
    <h1 class="text-4xl font-semibold">
      {{ frontmatter.title }}
    </h1>

    <div v-for="section in data" :key="section.title" class="space-y-10">
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">
          {{ section.title }}
        </h2>
        <div v-for="project in section.projects" :key="project.url" class="flex items-center justify-between gap-2 min-w-0">
          <a :href="project.url" class="truncate hover:underline underline-offset-4 hover:text-primary transition-all duration-200 ease-linear">
            {{ project.name }}
          </a>
        </div>
      </section>
    </div>

    <div class="flex justify-center">
      <Button href="/" size="md">
        Back to Home
      </Button>
    </div>
  </section>
</template>
