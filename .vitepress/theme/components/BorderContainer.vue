<script setup lang="ts">
const props = defineProps<{
  size?: 'sm' | 'md'
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'p-4 md:p-5'
    default:
      return 'p-5 md:p-8'
  }
})
</script>

<template>
  <div class="rounded-xl border border-(--color-border) bg-(--color-surface) shadow-[0_10px_32px_-20px_rgba(0,0,0,0.45)]" :class="sizeClass">
    <slot />
  </div>
</template>
