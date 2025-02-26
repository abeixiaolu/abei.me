<script setup lang="ts">
import { PowerGlitch } from 'powerglitch'

const route = useRoute()
const navList = computed(() => {
  return [
    { name: 'Blog', icon: 'i-ph-notepad-duotone', path: '/blog', active: route.path.startsWith('/blog') },
    { name: 'Project', icon: 'i-ph-folder-notch-minus-duotone', path: '/project', active: route.path.startsWith('/project') },
    { name: 'Demo', icon: 'i-ph-code-simple-duotone', path: '/demo', active: route.path.startsWith('/demo') },
    { name: 'Use', icon: 'i-ph-bag-simple-duotone', path: '/use', active: route.path.startsWith('/use') },
    { name: 'Gallery', icon: 'i-ph-image-square-duotone', path: '/gallery', active: route.path.startsWith('/gallery') },
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

      <div class="flex items-center gap-2 sm:gap-4">
        <a v-for="nav in navList" :key="nav.path" :href="nav.path" class="flex items-center pb-1 mt-1 border-3 border-transparent border-double" :class="{ 'text-primary border-b-primary': nav.active }">
          <span :class="nav.icon" />
        </a>
        <ThemeBtn />
      </div>
    </div>
  </header>
</template>
