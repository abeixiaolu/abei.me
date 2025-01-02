<script setup lang="ts">
const { frontmatter } = useData();
</script>

<template>
  <article class="mx-4 border-4 border-black bg-white p-8 shadow-[8px_8px_0_black] space-y-16 md:p-12">
    <h1 class="text-6xl font-semibold">
      {{ frontmatter.title }}
    </h1>

    <Content class="text-black prose prose-zinc" />
  </article>

  <div class="mt-16 flex justify-center">
    <ButtonPrimary href="/blog">
      Back to Blog
    </ButtonPrimary>
  </div>
</template>