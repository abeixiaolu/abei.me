<script setup lang="ts">
import { useData } from 'vitepress'

const { isDark } = useData()

async function toggleDark() {
  isDark.value = !isDark.value
}
</script>

<template>
  <button class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-(--color-text-soft) transition-colors hover:bg-(--color-primary-hover) hover:text-(--color-heading)" @click="toggleDark">
    <div :class="isDark ? 'i-ph-moon-stars-duotone text-base' : 'i-ph-sun-dim-duotone text-base'" />
  </button>
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}
</style>
