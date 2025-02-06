<script lang="ts" setup>
defineProps<{
  year: number
}>()
</script>

<template>
  <div class="relative select-none h-10">
    <span class="text-[8em] top-[-80px] absolute font-bold text-transparent dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.2)] [-webkit-text-stroke:1px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear pointer-events-none">{{ year }}</span>
  </div>
</template>
