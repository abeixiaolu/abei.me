<script setup lang="ts">

const { frontmatter } = useData();
</script>

<template>
  <div class="min-h-screen">
    <TheHeader class="top-0 z-10" />
    <div class="px-4 py-16">
      <main class="mx-auto max-w-screen-md">
        <Home v-if="frontmatter.layout === 'home'" />
        <BlogIndex v-else-if="frontmatter.layout === 'blog'" />
        <BlogShow v-else-if="frontmatter.layout === 'blog-show'" />
        <ProjectIndex v-else-if="frontmatter.layout === 'projects'" />
      </main>
    </div>
  </div>
</template>
