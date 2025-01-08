<script lang="ts" setup>
defineProps<{
  href: string
}>()
</script>

<template>
  <a
    :href
    class="text-black border-4 border-black bg-[var(--color-green)] px-4 py-1 shadow-[4px_4px_0_black] transition duration-150 ease-linear hover:bg-[var(--color-green-light)] hover:shadow-[6px_6px_0_black] hover:-translate-x-[0.125rem] hover:-translate-y-[0.125rem]"
  >
    <slot />
  </a>
</template>
