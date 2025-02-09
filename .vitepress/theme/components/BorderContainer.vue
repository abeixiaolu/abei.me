<script setup lang="ts">
const props = defineProps<{
  size?: 'sm' | 'md'
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'shadow-[4px_4px_0_#000]'
    default:
      return 'p-4 md:p-8 shadow-[6px_6px_0_#000]'
  }
})
</script>

<template>
  <div class="border-2 border-black" :class="sizeClass">
    <slot />
  </div>
</template>
