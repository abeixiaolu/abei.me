<script setup lang="ts">
const { frontmatter } = useData()
</script>

<template>
  <div class="layout-root">
    <Background />
    <Home v-if="frontmatter.layout === 'home'" />
    <SideLayout v-else>
      <BlogIndex v-if="frontmatter.layout === 'blog'" />
      <BlogShow v-else-if="frontmatter.layout === 'blog-show'" />
      <Projects v-else-if="frontmatter.layout === 'projects'" />
      <Demos v-else-if="frontmatter.layout === 'demo'" />
      <Uses v-else-if="frontmatter.layout === 'uses'" />
      <Gallery v-else-if="frontmatter.layout === 'gallery'" />
      <Content v-else />
    </SideLayout>
  </div>
</template>

<style scoped>
.layout-root {
  height: 100vh;
  overflow: hidden;
}

@media (max-width: 768px) {
  .layout-root {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}
</style>
