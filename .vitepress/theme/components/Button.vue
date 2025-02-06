<script lang="ts">
import { tv } from 'tailwind-variants'

const button = tv({
  base: ['inline-flex gap-1 items-center justify-center px-2 py-1 border-1 border-[#8882] rounded-[2px] text-sm text-[#888A] hover:bg-primary hover:text-white hover:border-primary'],
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
