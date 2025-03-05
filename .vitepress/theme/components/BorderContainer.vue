<script setup lang="ts">
const props = defineProps<{
  size?: 'sm' | 'md'
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#506C59]'
    default:
      return 'p-4 md:p-8 shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_#506C59]'
  }
})
</script>

<template>
  <div class="border-2 border-black dark:border-[#506C59]" :class="sizeClass">
    <slot />
  </div>
</template>
