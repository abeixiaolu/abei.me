<script lang="ts">
import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

const button = tv({
  base: [
    'relative z-1 inline-flex gap-1 items-center justify-center border-2',
    'after:absolute after:transition-all  hover:after:w-full hover:after:h-full  after:w-[10%] after:h-[20%] after:border-t-0 after:border-l-0',
    'before:absolute before:transition-all hover:before:w-full hover:before:h-full before:top-[2px] before:left-[2px] before:w-[10%] before:h-[20%]',
  ],
  variants: {
    variant: {
      primary: 'border-primary before:border-primary after:border-primary text-primary',
      secondary: 'border-secondary before:border-secondary after:border-secondary text-secondary',
      default: 'border-black before:border-black after:border-black',
    },
    size: {
      sm: 'px-2 py-0.5 border-1 after:border-1 before:border-1 after:border-l-0 after:border-t-0 before:border-r-0 before:border-b-0 after:bottom-[1px] after:right-[1px] before:top-[1px] before:left-[1px] hover:after:border-r-[2px] hover:after:border-b-[2px] hover:after:bottom-[-2px] hover:after:right-[-2px]',
      md: 'px-3 py-1.5 border-2 after:border-2 before:border-2 after:border-l-0 after:border-t-0 before:border-r-0 before:border-b-0 after:bottom-[2px] after:right-[2px] before:top-[2px] before:left-[2px] hover:after:border-r-[4px] hover:after:border-b-[4px] hover:after:bottom-[-4px] hover:after:right-[-4px]',
      lg: 'px-6 py-4 border-4 after:border-4 before:border-4 after:border-l-0 after:border-t-0 before:border-r-0 before:border-b-0 after:bottom-[4px] after:right-[4px] before:top-[4px] before:left-[4px] hover:after:border-r-[8px] hover:after:border-b-[8px] hover:after:bottom-[-8px] hover:after:right-[-8px]',
    },
    smooth: {
      true: '',
    },
  },
  compoundVariants: [
    {
      size: 'sm',
      smooth: true,
      class: 'hover:before:translate-x-[-2px] hover:before:translate-y-[-2px]',
    },
    {
      size: 'md',
      smooth: true,
      class: 'hover:before:translate-x-[-4px] hover:before:translate-y-[-4px]',
    },
    {
      size: 'lg',
      smooth: true,
      class: 'hover:before:translate-x-[-8px] hover:before:translate-y-[-8px]',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    smooth: true,
  },
})

type ButtonVariant = VariantProps<typeof button>
</script>

<script lang="ts" setup>
const props = defineProps<{
  icon?: string
  variant?: ButtonVariant['variant']
  size?: ButtonVariant['size']
  smooth?: ButtonVariant['smooth']
}>()

const ui = computed(() => button({
  variant: props.variant,
  size: props.size,
  smooth: props.smooth,
}))
</script>

<template>
  <a v-bind="$attrs" :class="ui">
    <span v-if="icon" :class="icon" />
    <slot />
  </a>
</template>
