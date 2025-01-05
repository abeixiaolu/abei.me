<script setup lang="ts">
defineProps<{
  icon: string
  text: string
}>()
</script>

<template>
  <span
    class="text-black dark:text-white inline-flex items-center text-sm align-baseline leading-none p-1 gap-1 bg-[#8882] rounded-sm"
  >
    <div class="text-[12px]" :class="[icon]" />
    {{ text }}
  </span>
</template>
