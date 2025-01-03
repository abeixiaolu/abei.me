<script lang="ts" setup>
defineProps<{
  href: string
}>()
</script>

<template>
  <a :href
    class="inline-block border-4 border-black bg-[var(--color-purple)] px-6 py-2 text-white shadow-[4px_4px_0_black] transition duration-150 ease-linear hover:bg-[#828cd2] hover:shadow-[6px_6px_0_black] hover:-translate-x-[0.125rem] hover:-translate-y-[0.125rem]">
    <slot />
  </a>
</template>