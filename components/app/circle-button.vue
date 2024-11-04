<script setup lang="ts">
const props = defineProps<{
  icon: string
  type?: 'default' | 'primary'
  disabled?: boolean
}>()

const emit = defineEmits(['click'])
const colorCls = computed(() => props.type === 'primary' ? 'bg-rose-400 text-white dark:bg-blue-400' : 'bg-gray-600 dark:bg-gray-500/80 text-white hover:bg-gray-500/90 dark:hover:bg-gray-400/80')
</script>

<template>
  <button
    class="flex items-center px-2 py-2 rounded-full"
    :class="[colorCls, { 'opacity-50 cursor-not-allowed': props.disabled }]"
    @click="emit('click', $event)"
  >
    <Icon
      :name="props.icon"
    />
  </button>
</template>
