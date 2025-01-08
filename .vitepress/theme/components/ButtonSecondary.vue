<script lang="ts" setup>
defineProps<{
  href: string
  icon?: string
}>()
</script>

<template>
  <a
    :href
    class="inline-flex items-center gap-1 border-4 border-black px-3 py-1 shadow-[4px_4px_0_black] transition duration-150 ease-linear hover:bg-[var(--color-tip-bg)] hover:shadow-[6px_6px_0_black] hover:-translate-x-[0.125rem] hover:-translate-y-[0.125rem]"
  >
    <span v-if="icon" :class="icon" />
    <slot />
  </a>
</template>
