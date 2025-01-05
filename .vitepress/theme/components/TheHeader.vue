<script lang="ts" setup>
const { site } = useData()
</script>

<template>
  <header class="border-b-4 border-black px-8 py-4">
    <div class="mx-auto max-w-screen-md flex flex-col items-center justify-between gap-6 md:flex-row">
      <span>
        <a href="/" class="text-2xl font-semibold">
          {{ site.title }}
        </a>
      </span>

      <div class="flex items-center gap-6">
        <ButtonPrimary href="/blog">
          Blog
        </ButtonPrimary>

        <ButtonPrimary href="/project">
          Project
        </ButtonPrimary>
      </div>
    </div>
  </header>
</template>
