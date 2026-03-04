<script setup lang="ts">
defineProps<{
  icon?: string
  text: string
}>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-primary-hover) px-2 py-0.5 align-baseline text-sm leading-none text-(--color-text-soft)"
  >
    <div v-if="icon" class="text-[12px]" :class="[icon]" />
    <span>{{ text }}</span>
  </span>
</template>
