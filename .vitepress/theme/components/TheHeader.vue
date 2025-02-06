<script setup lang="ts">
const route = useRoute()
const navList = computed(() => {
  return [
    { name: 'Blog', path: '/blog', active: route.path.startsWith('/blog') },
    { name: 'Project', path: '/project', active: route.path.startsWith('/project') },
  ]
})
</script>

<template>
  <header class="px-8 py-4">
    <div class="relative mx-auto max-w-screen-md flex justify-between gap-6">
      <span>
        <a href="/">
          <h1 class="uppercase text-3xl">Abei</h1>
        </a>
      </span>

      <div class="flex items-center gap-4">
        <a v-for="nav in navList" :key="nav.path" :href="nav.path" :class="{ 'font-bold underline decoration-2': nav.active }">
          {{ nav.name }}
        </a>
      </div>
    </div>
  </header>
</template>
