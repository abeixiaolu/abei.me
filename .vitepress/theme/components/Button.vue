<script lang="ts">
import { tv } from 'tailwind-variants'

const button = tv({
  base: ['inline-flex gap-1 items-center justify-center cursor-pointer font-mono text-xs tracking-widest px-3 py-1 border border-[var(--color-hairline)] text-[var(--color-text)] opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all duration-200'],
})
</script>

<script lang="ts" setup>
defineProps<{
  icon?: string
}>()

const ui = computed(() => button({
}))
</script>

<template>
  <a v-bind="$attrs" :class="ui">
    <span v-if="icon" :class="icon" />
    <slot />
  </a>
</template>
