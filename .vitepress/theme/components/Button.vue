<script lang="ts">
import { tv } from 'tailwind-variants'

const button = tv({
  base: ['inline-flex items-center justify-center gap-1 rounded-full border border-(--color-border) px-3 py-1.5 text-sm text-(--color-text-soft) transition-colors hover:border-(--color-primary) hover:text-(--color-heading)'],
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
