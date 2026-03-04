<script setup lang="ts">
const route = useRoute()
const elevated = ref(false)

const navList = computed(() => {
  return [
    { name: 'Blog', path: '/blog', active: route.path.startsWith('/blog') },
    { name: 'Project', path: '/project', active: route.path.startsWith('/project') },
    { name: 'Demo', path: '/demo', active: route.path.startsWith('/demo') },
    { name: 'Use', path: '/use', active: route.path.startsWith('/use') },
    { name: 'Gallery', path: '/gallery', active: route.path.startsWith('/gallery') },
  ]
})

function onScroll() {
  elevated.value = window.scrollY > 16
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-(--color-border) transition-all duration-300"
    :class="elevated ? 'bg-(--color-bg)/84 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.05)]' : 'bg-(--color-bg)'"
  >
    <div class="site-shell flex items-center justify-between gap-4 py-4 font-family-anwt">
      <a href="/" class="text-[1.45rem] tracking-[0.06em] text-(--color-heading)">
        abei.me
      </a>

      <nav class="flex items-center gap-2 md:gap-3 text-[0.88rem]">
        <a
          v-for="nav in navList"
          :key="nav.path"
          :href="nav.path"
          class="rounded-full px-2.5 py-1 transition-colors duration-200"
          :class="nav.active ? 'text-(--color-heading) bg-(--color-primary-hover)' : 'text-(--color-text-soft) hover:text-(--color-heading)'"
        >
          {{ nav.name }}
        </a>
        <ThemeBtn />
      </nav>
    </div>
  </header>
</template>
