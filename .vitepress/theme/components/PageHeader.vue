<script lang="ts" setup>
const { frontmatter } = useData()
</script>

<template>
  <header class="mb-10 border-b border-(--color-border) pb-6 font-family-anwt">
    <h1 class="mb-3 text-4xl text-(--color-heading) tracking-[0.01em]">
      {{ frontmatter.title }}
    </h1>
    <p v-if="frontmatter.description" class="max-w-2xl text-sm leading-7 text-(--color-text-soft)">
      {{ frontmatter.description }}
    </p>
  </header>
</template>
