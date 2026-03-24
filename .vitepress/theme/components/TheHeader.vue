<script setup lang="ts">
import { PowerGlitch } from 'powerglitch'

const route = useRoute()
const navList = computed(() => {
  return [
    { name: 'Blog', icon: 'i-ph-notepad-duotone', path: '/blog', active: route.path.startsWith('/blog') },
    { name: 'Project', icon: 'i-ph-sparkle-duotone', path: '/project', active: route.path.startsWith('/project') },
    { name: 'Demo', icon: 'i-ph-brackets-angle-duotone', path: '/demo', active: route.path.startsWith('/demo') },
    { name: 'Use', icon: 'i-ph-bag-duotone', path: '/use', active: route.path.startsWith('/use') },
    { name: 'Gallery', icon: 'i-ph-camera-duotone', path: '/gallery', active: route.path.startsWith('/gallery') },
  ]
})

onMounted(() => {
  PowerGlitch.glitch('.logo-glitch')
})
</script>

<template>
  <header class="header-root px-8 py-4 font-family-anwt">
    <div class="relative mx-auto max-w-screen-md flex justify-between items-center gap-6">
      <div class="flex items-center gap-4">
        <a href="/" class="flex items-center gap-3">
          <h1 class="uppercase text-3xl logo-glitch logo-text">Abei</h1>
        </a>
        <span class="sys-label">SYS.001</span>
      </div>

      <div class="flex items-center gap-2 sm:gap-4">
        <a v-for="nav in navList" :key="nav.path" :href="nav.path"
          class="nav-link flex items-center pb-1 mt-1 border-3 border-transparent border-double"
          :class="{ 'active-nav': nav.active }">
          <span :class="nav.icon" />
        </a>
        <ThemeBtn />
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-root {
  border-bottom: 1px solid var(--color-hairline);
  backdrop-filter: blur(4px);
  background: color-mix(in srgb, var(--color-bg) 90%, transparent);
}

.logo-text {
  position: relative;
  display: inline-block;
}

.logo-text::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-accent);
  transform: scaleX(0.4);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.logo-text:hover::after {
  transform: scaleX(1);
}

.sys-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.6rem;
  letter-spacing: 0.15rem;
  color: var(--color-text);
  opacity: 0.35;
  text-transform: uppercase;
  margin-top: 2px;
}

.nav-link {
  transition: color 0.2s ease;
}

.active-nav {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent) !important;
}
</style>
