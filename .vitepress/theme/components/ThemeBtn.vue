<script setup lang="ts">
import { useData } from 'vitepress'

const { isDark } = useData()

function toggleDark() {
  isDark.value = !isDark.value
}
</script>

<template>
  <button @click="toggleDark">
    <div :class="isDark ? 'i-solar-moon-sleep-linear' : 'i-solar-water-sun-linear'" />
  </button>
</template>
