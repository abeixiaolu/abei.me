<script lang="ts" setup>
import { data } from '../../data/github-projects.data'
</script>

<template>
  <section class="site-shell py-8 font-family-anwt">
    <PageHeader />
    <div class="space-y-9">
      <div v-for="section in data" :key="section.title">
        <StrokeLineText size="sm" :text="section.title" />
        <section class="space-y-3">
          <Project v-for="project in section.projects" :key="project.url" :project />
        </section>
      </div>
    </div>

    <div class="my-14 flex justify-center">
      <Button href="/" size="md">
        Back to Home
      </Button>
    </div>
  </section>
</template>
