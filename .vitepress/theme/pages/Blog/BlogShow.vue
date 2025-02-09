<script setup lang="ts">
const { frontmatter } = useData()
</script>

<template>
  <article>
    <BorderContainer>
      <h1 class="text-3xl lg:text-3xl font-semibold">
        {{ frontmatter.title }}
      </h1>
      <Content class="prose prose-sm sm:prose-base dark:prose-invert" />
    </BorderContainer>
  </article>

  <div class="mt-16 flex justify-center">
    <Button href="/blog">
      Back to Blog
    </Button>
  </div>
</template>
