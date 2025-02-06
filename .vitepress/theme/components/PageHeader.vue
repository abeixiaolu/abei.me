<script lang="ts" setup>
const { frontmatter } = useData()
</script>

<template>
  <header class="mb-10">
    <h1 class="text-4xl font-semibold mb-4">
      {{ frontmatter.title }}
    </h1>
    <p class="opacity-50">
      {{ frontmatter.description }}
    </p>
  </header>
</template>
