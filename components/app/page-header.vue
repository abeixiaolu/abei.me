<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="mb-8">
    <h2 class="text-2xl font-bold mb-6 chakra">
      {{ title }}
    </h2>
    <slot />
  </div>
</template>
