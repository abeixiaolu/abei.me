<script setup lang="ts">
import { PowerGlitch } from 'powerglitch'

const route = useRoute()
const navList = computed(() => {
  return [
    { name: 'Blog', path: '/blog', active: route.path.startsWith('/blog') },
    { name: 'Project', path: '/project', active: route.path.startsWith('/project') },
    { name: 'Demo', path: '/demo', active: route.path.startsWith('/demo') },
    { name: 'Use', path: '/use', active: route.path.startsWith('/use') },
    { name: 'Gallery', path: '/gallery', active: route.path.startsWith('/gallery') },
  ]
})

onMounted(() => {
  PowerGlitch.glitch('.logo-glitch')
})
</script>

<template>
  <header class="px-8 py-4 font-family-anwt">
    <div class="relative mx-auto max-w-screen-md flex justify-between gap-6">
      <span>
        <a href="/">
          <h1 class="uppercase text-3xl logo-glitch">Abei</h1>
        </a>
      </span>

      <div class="flex items-center gap-4">
        <a v-for="nav in navList" :key="nav.path" :href="nav.path" :class="{ 'underline underline-offset-6 decoration-2': nav.active }">
          {{ nav.name }}
        </a>
        <ThemeBtn />
      </div>
    </div>
  </header>
</template>
