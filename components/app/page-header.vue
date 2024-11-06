<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="mb-10">
    <h1 class="text-2xl font-bold mb-6 chakra">
      {{ title }}
    </h1>
    <slot />
  </div>
</template>
