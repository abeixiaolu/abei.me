<script lang="ts" setup>
const props = defineProps<{
  text: number | string
  size?: 'sm'
}>()
</script>

<template>
  <div class="mb-4 flex items-center gap-3 font-family-anwt select-none">
    <span class="h-px flex-1 bg-(--color-border)" />
    <span class="tracking-[0.18em] text-(--color-text-soft)" :class="props.size === 'sm' ? 'text-xs' : 'text-[0.72rem]'">
      {{ text }}
    </span>
    <span class="h-px w-8 bg-(--color-border)" />
  </div>
</template>
