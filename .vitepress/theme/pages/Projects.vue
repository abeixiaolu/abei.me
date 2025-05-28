<script lang="ts" setup>
import { data } from '../../data/github-projects.data'
</script>

<template>
  <section class="font-family-anwt mx-auto max-w-screen-md">
    <PageHeader />
    <div class="space-y-10">
      <div v-for="section in data" :key="section.title">
        <StrokeLineText size="sm" :text="section.title" />
        <section class="space-y-4 pl-4 pt-2">
          <Project v-for="project in section.projects" :key="project.url" :project />
        </section>
      </div>
    </div>

    <div class="flex justify-center mt-12">
      <Button href="/" size="md">
        Back to Home
      </Button>
    </div>
  </section>
</template>
