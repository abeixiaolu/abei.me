<script setup lang="ts">
defineProps<{
  icon?: string
  text: string
}>()
</script>

<template>
  <span
    class="inline-flex items-center text-sm align-baseline leading-none p-1 gap-1 bg-[#8882] rounded-sm"
  >
    <div v-if="icon" class="text-[12px]" :class="[icon]" />
    <span class="opacity-70">{{ text }}</span>
  </span>
</template>
