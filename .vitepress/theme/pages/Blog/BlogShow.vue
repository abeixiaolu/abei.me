<script setup lang="ts">
const { frontmatter } = useData();
</script>

<template>
  <article class="border-4 border-black p-2 md:p-8 shadow-[8px_8px_0_black] space-y-8 lg:space-y-16">
    <h1 class="text-3xl lg:text-6xl font-semibold">
      {{ frontmatter.title }}
    </h1>

    <Content class="prose dark:prose-invert prose-sm" />
  </article>

  <div class="mt-16 flex justify-center">
    <ButtonPrimary href="/blog">
      Back to Blog
    </ButtonPrimary>
  </div>
</template>