<script setup lang="ts">
import { data } from '../../../data/blog.data'

const { frontmatter } = useData()
</script>

<template>
  <section class="space-y-8 md:space-y-16">
    <h1 class="text-4xl font-semibold">
      {{ frontmatter.title }}
    </h1>

    <div class="space-y-4">
      <BlogCard v-for="post in data" :key="post.url" :post="post" />
    </div>

    <div class="flex justify-center">
      <Button href="/" size="md">
        Back to Home
      </Button>
    </div>
  </section>
</template>
