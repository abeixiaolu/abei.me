<script setup lang="ts">

const { frontmatter } = useData();
</script>

<template>
  <div class="min-h-screen py-16">
    <main class="mx-auto max-w-screen-md">
      <BlogIndex v-if="frontmatter.layout === 'blog'" />
      <BlogShow v-else-if="frontmatter.layout === 'blog-show'" />
      <ProjectIndex v-else-if="frontmatter.layout === 'projects'" />
    </main>
  </div>
</template>
