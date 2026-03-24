<script setup lang="ts">
const { frontmatter } = useData()
</script>

<template>
  <article class="blog-show font-family-anwt">
    <div class="show-meta-header">
      <span>ARTICLE // BLOG</span>
      <span v-if="frontmatter.date">{{ frontmatter.date?.split('T')[0] }}</span>
    </div>

    <div class="blog-content">
      <h1 class="show-title">
        {{ frontmatter.title }}
      </h1>
      <Content class="prose prose-sm sm:prose-base dark:prose-invert" />
    </div>

    <div class="back-btn">
      <Button href="/blog">Back to Blog</Button>
    </div>
  </article>
</template>

<style scoped>
.blog-show {
  max-width: 100%;
}

.show-meta-header {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  color: var(--color-text);
  opacity: 0.45;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  border-bottom: 1px solid var(--color-hairline);
  padding-bottom: 0.75rem;
  margin-bottom: 2rem;
}

.blog-content {
  padding-top: 0.5rem;
}

.show-title {
  font-size: 1.8rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  letter-spacing: 0.1rem;
  line-height: 1.4;
}

.back-btn {
  display: flex;
  justify-content: center;
  margin: 3rem 0;
}
</style>
