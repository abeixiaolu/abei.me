<script lang="ts" setup>
const props = defineProps<{
  text: number | string
  size?: 'sm'
}>()

const fontSize = computed(() => {
  if (props.size === 'sm')
    return 'text-[3em] top-[-0.4em]'
  return 'text-[8em] top-[-0.6em]'
})
</script>

<template>
  <div class="relative select-none h-10 z-0">
    <span :class="fontSize" class="absolute font-bold z-[-1] text-gray-400/5 dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.3)] [-webkit-text-stroke:1px_rgba(0,0,0,0.3)] pointer-events-none">{{ text }}</span>
  </div>
</template>
