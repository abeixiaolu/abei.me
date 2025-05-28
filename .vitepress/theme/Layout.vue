<script setup lang="ts">
const { frontmatter } = useData()
</script>

<template>
  <div class="min-h-screen">
    <Background />
    <TheHeader class="top-0 z-10" />
    <Home v-if="frontmatter.layout === 'home'" />
    <BlogIndex v-else-if="frontmatter.layout === 'blog'" />
    <BlogShow v-else-if="frontmatter.layout === 'blog-show'" />
    <Projects v-else-if="frontmatter.layout === 'projects'" />
    <Demos v-else-if="frontmatter.layout === 'demo'" />
    <Uses v-else-if="frontmatter.layout === 'uses'" />
    <Gallery v-else-if="frontmatter.layout === 'gallery'" />
    <Content v-else />
  </div>
</template>
