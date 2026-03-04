<script setup lang="ts">
const showTop = ref(false)

function updateState() {
  showTop.value = window.scrollY > 320
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  updateState()
  window.addEventListener('scroll', updateState, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateState)
})
</script>

<template>
  <div class="fixed bottom-6 right-5 z-30 flex flex-col gap-2 md:bottom-8 md:right-8">
    <a
      href="/blog"
      class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-text-soft) transition hover:text-(--color-heading)"
      aria-label="Blog"
    >
      <i class="i-ph-notepad text-base" />
    </a>
    <button
      class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-text-soft) transition hover:text-(--color-heading)"
      aria-label="Back to top"
      :class="showTop ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-1'"
      @click="backToTop"
    >
      <i class="i-ph-arrow-up text-base" />
    </button>
  </div>
</template>
