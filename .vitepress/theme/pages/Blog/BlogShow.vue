<script setup lang="ts">
const { frontmatter } = useData()
const date = computed(() => frontmatter.value.date?.split('T')[0] || '')
</script>

<template>
  <article class="site-shell py-8">
    <BorderContainer>
      <header class="content-shell mb-8 border-b border-(--color-border) pb-6 font-family-anwt">
        <h1 class="text-3xl leading-tight text-(--color-heading) md:text-[2rem]">
          {{ frontmatter.title }}
        </h1>
        <p v-if="date" class="mt-3 text-xs tracking-[0.12em] text-(--color-text-soft)">
          {{ date }}
        </p>
      </header>

      <div class="content-shell">
        <Content class="prose prose-sm sm:prose-base dark:prose-invert" />
      </div>
    </BorderContainer>
  </article>

  <div class="my-14 flex justify-center">
    <Button href="/blog">
      Back to Blog
    </Button>
  </div>
</template>
