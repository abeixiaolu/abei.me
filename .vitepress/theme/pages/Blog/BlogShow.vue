<script setup lang="ts">
const { frontmatter } = useData()
</script>

<template>
  <article class="max-w-screen-md mx-auto px-4">
    <BorderContainer>
      <h1 class="text-3xl lg:text-3xl font-semibold mb-4">
        {{ frontmatter.title }}
      </h1>
      <Content class="prose prose-sm sm:prose-base dark:prose-invert" />
    </BorderContainer>
  </article>

  <div class="my-16 flex justify-center">
    <Button href="/blog">
      Back to Blog
    </Button>
  </div>
</template>
